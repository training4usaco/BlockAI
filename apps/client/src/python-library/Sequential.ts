export const Sequential = `
class Sequential:
    def __init__(self, layers, tokenizer, embedding_dim, context_len):
        self.layers = layers
        self.tokenizer = tokenizer
        self.embedding_dim = embedding_dim
        self.context_len = context_len
        self.lossi = []
        
        vocab_size = tokenizer.vocab_size
        self.C = torch.randn((vocab_size, embedding_dim))
        
        self.C.requires_grad = True
        for layer in self.layers:
            for p in layer.parameters():
                p.requires_grad = True

    def __call__(self, x):
        emb = self.C[x]
        
        # (Batch, Context, Emb) -> (Batch, Context * Emb)
        x = emb.view(x.shape[0], -1)
        
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [self.C] + [p for layer in self.layers for p in layer.parameters()]
`;