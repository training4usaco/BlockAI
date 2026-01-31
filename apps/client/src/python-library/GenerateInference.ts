export const GenerateInference = (numSamples: string, modelVar: string) => {
    return `for _ in range(${numSamples}):
    out = []
    context = [0] * ${modelVar}.context_len
    while True:
          logits = ${modelVar}(torch.tensor([context]))
          probs = F.softmax(logits, dim=1)
          ix = torch.multinomial(probs, num_samples=1).item()

          context = context[1:] + [ix]
          out.append(ix)

          if ix == 0:
                break

    print(''.join(${modelVar}.tokenizer.itos[i] for i in out))

` 
}