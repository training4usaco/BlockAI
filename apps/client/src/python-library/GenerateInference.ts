export const GenerateInference = (numSamples: string, modelVar: string) => {
    return `print(f"Generating ${numSamples} samples...")
stop_token_idx = ${modelVar}.tokenizer.stoi[${modelVar}.tokenizer.eos_token]
for _ in range(${numSamples}):
    out = []
    context = [stop_token_idx] * ${modelVar}.context_len
    while True:
          logits = ${modelVar}(torch.tensor([context]))
          probs = F.softmax(logits, dim=1)
          ix = torch.multinomial(probs, num_samples=1).item()
          
          if ix == stop_token_idx:
                break

          context = context[1:] + [ix]
          out.append(ix)
          
    print(''.join(${modelVar}.tokenizer.itos[i] for i in out))
print()

` 
}