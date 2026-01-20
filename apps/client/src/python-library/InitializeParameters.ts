export const InitializeParameters = (embeddingTable: string, params: string, modelName: string, tokenizer: string, embDim: string) => {
    return `${embeddingTable} = torch.randn((${tokenizer}.vocab_size, ${embDim}))\n` +
    `${params} = [${embeddingTable}] + [p for layer in ${modelName} for p in layer.parameters()]\n` +
    `for p in ${params}:\n` +
    `    p.requires_grad = True;\n\n`
}