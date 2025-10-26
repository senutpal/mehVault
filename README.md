# mehVault

A web-based cryptocurrency wallet generator supporting multiple blockchains. Generate secure HD wallets from seed phrases for Solana and Ethereum.

## Features

- Generate BIP39-compliant seed phrases
- Support for multiple blockchains (Solana & Ethereum)
-  Hierarchical Deterministic (HD) wallet generation
- Dark/Light theme support
- Responsive design
- Built with Next.js for optimal performance

## Tech Stack

- **Framework:** Next.js 16 with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** 
  - Solana Web3.js
  - Ethers.js (Ethereum)
- **Crypto:** BIP39, ed25519-hd-key, tweetnacl

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/senutpal/mehVault.git
cd mehVault

# Install dependencies
pnpm install
```

### Development
```bash
pnpm dev
```
Open http://localhost:3000 to view the app.

### Build
```bash
pnpm build
pnpm start
```
## Usage
1. Select Blockchain: Choose between Solana or Ethereum
2. Seed Phrase: Generate a new seed phrase or import an existing one
3. View Wallets: Access your generated wallet addresses and private keys

### Security Warning
This is a development tool for educational purposes. Never use this in production or for real funds.

Never share your seed phrase or private keys
Always use hardware wallets for significant amounts
This application stores sensitive data in browser memory