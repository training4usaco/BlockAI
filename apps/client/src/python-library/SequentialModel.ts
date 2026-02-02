export const SequentialModel = `
class SequentialModel(nn.Module):
    def __init__(self, layers, tokenizer, embedding_dim, context_len):
        self.layers = layers
        self.tokenizer = tokenizer
        self.embedding_dim = embedding_dim
        self.context_len = context_len
        self.loss_history = []
        
        for layer in self.layers:
            for p in layer.parameters():
                p.requires_grad = True

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]
`;