export const ReLU = 
    "class ReLU:\n" +
    "    def __call__(self, x):\n" +
    "        self.out = torch.relu(x)\n" +
    "        return self.out\n" +
    "\n" +
    "    def parameters(self):\n" +
    "        return []\n"