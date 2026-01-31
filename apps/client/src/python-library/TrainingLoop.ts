export const TrainingLoop = (steps: string, batchSize: string, lrMax: string, modelVar: string, trainingData: string) => {
    return `print(f"Starting training for ${steps} steps...")
xtr, ytr = ${trainingData}
for i in range(${steps}):
    lr = ${lrMax} * 0.5 * (1.0 + math.cos(math.pi * i / ${steps}))
    idx = torch.randint(0, xtr.shape[0], (${batchSize},))
    xb, yb = xtr[idx], ytr[idx]

    logits = ${modelVar}(xb)
    loss = F.cross_entropy(logits, yb)

    for p in ${modelVar}.parameters():
        p.grad = None
    loss.backward()

    lr = 0.08 if i < 100000 else 0.008
    for p in ${modelVar}.parameters():
        p.data -= lr * p.grad

    if i % 1000 == 0:
        print(f'{i:7d}/{${steps}:7d}: {loss.item():.4f}')
    ${modelVar}.loss_history.append(loss.item())
        
for layer in ${modelVar}.layers:
    layer.training = False
    
`;
};