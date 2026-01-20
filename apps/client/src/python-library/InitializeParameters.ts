export const InitializeParameters = (varname: string, modelName: string, tokenizer: string, embDim: string) => {
    return `${varname} = torch.randn((${tokenizer}.vocab_size, ${embDim}))\n` +
    `parameters = [${varname}] + [p for layer in ${modelName} for p in layer.parameters()]\n` +
    `for p in parameters:\n` +
    `    p.requires_grad = True;\n\n`
}