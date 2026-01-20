export const InitializeParameters = (modelName: string, tokenizer: string, embDim: string) => {
    return `C = torch.randn((${tokenizer}.vocab_size, ${embDim}))\n` +
    `parameters = [C] + [p for layer in ${modelName} for p in layer.parameters()]\n` +
    `for p in parameters:\n` +
    `    p.requires_grad = True;\n\n`
}