export const TokenEmbedding = `class TokenEmbedding(nn.Module):
    def __init__(self, vocab_size, embedding_dim):
        self.weight = torch.randn(vocab_size, embedding_dim)

    def __call__(self, idx):
        self.out = self.weight[idx]
        return self.out

    def parameters(self):
        return [self.weight]\n`