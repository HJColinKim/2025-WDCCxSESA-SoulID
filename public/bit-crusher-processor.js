class BitCrusherProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            { name: 'bitDepth', defaultValue: 16, minValue: 1, maxValue: 16 },
            { name: 'sampleRateReduction', defaultValue: 1, minValue: 1, maxValue: 50 },
        ];
    }

    constructor() {
        super();
        this.sampleCounters = [0, 0]; // Separate counter for each channel
        this.lastCrushedSamples = [0, 0]; // Separate last sample for each channel
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];
        const bitDepth = parameters.bitDepth;
        const sampleRateReduction = parameters.sampleRateReduction;

        // If there's no input, output silence
        if (!input || input.length === 0) {
            for (let channel = 0; channel < output.length; channel++) {
                const outputChannel = output[channel];
                for (let i = 0; i < outputChannel.length; i++) {
                    outputChannel[i] = 0;
                }
            }
            return true;
        }

        for (let channel = 0; channel < Math.min(input.length, output.length); channel++) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            if (!inputChannel || !outputChannel) continue;

            // Ensure we have counters for this channel
            if (!this.sampleCounters[channel]) this.sampleCounters[channel] = 0;
            if (!this.lastCrushedSamples[channel]) this.lastCrushedSamples[channel] = 0;

            for (let i = 0; i < Math.min(inputChannel.length, outputChannel.length); i++) {
                const currentBitDepth = Math.max(1, Math.min(16, bitDepth[i] || bitDepth[0] || 16));
                const currentSampleReduction = Math.max(1, Math.floor(sampleRateReduction[i] || sampleRateReduction[0] || 1));
                const levels = Math.pow(2, currentBitDepth);

                if (this.sampleCounters[channel] % currentSampleReduction === 0) {
                    // Clamp input to prevent extreme values
                    const clampedInput = Math.max(-1, Math.min(1, inputChannel[i] || 0));
                    const quantized = Math.round(clampedInput * levels) / levels;
                    this.lastCrushedSamples[channel] = Math.tanh(quantized * 1.2);

                    // Additional safety check
                    if (!isFinite(this.lastCrushedSamples[channel]) || isNaN(this.lastCrushedSamples[channel])) {
                        this.lastCrushedSamples[channel] = 0;
                    }
                }

                outputChannel[i] = this.lastCrushedSamples[channel];
                this.sampleCounters[channel]++;
            }
        }
        return true;
    }
}

registerProcessor('bit-crusher-processor', BitCrusherProcessor);
