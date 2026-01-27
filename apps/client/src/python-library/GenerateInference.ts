export const GenerateInference = (
    numSamples: string,
    tokenizer: string,
    embTable: string,
    blockSize: string,
    modelVar: string,) => {
    return `for _ in range(${numSamples}):\n` +
        '    out = []\n' +
        `    context = [0] * ${blockSize}\n` +
        '    while True:\n' +
        `          emb = ${embTable}[torch.tensor([context])]\n` +
        '          x = emb.view(emb.shape[0], -1)\n' +
        `          for layer in ${modelVar}:\n` +
        '              x = layer(x)\n' +
        '          logits = x\n' +
        '          probs = F.softmax(logits, dim=1)\n' +
        '          ix = torch.multinomial(probs, num_samples=1).item()\n' +
        '\n' +
        '          context = context[1:] + [ix]\n' +
        '          out.append(ix)\n' +
        '\n' +
        '          if ix == 0:\n' +
        '                break\n' +
        '\n' +
        `    print(''.join(${tokenizer}.itos[i] for i in out))\n\n`
}