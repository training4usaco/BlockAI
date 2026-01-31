export const CalculateLoss = 
    `def calculate_loss(dataset, model, dataset_name):
    x, y = dataset
    logits = model(x)
    loss = F.cross_entropy(logits, y)
    print(f'{dataset_name} loss: {loss.item()}')
    print()`;