// DATOS COMPARTIDOS (estado intrínseco) de cada activo del simulador.
// Es información que nunca cambia por usuario ni por operación.

const ASSET_CATALOG = [
    { symbol: 'BTC/USD',  name: 'Bitcoin',    category: 'CRYPTO', decimals: 8 },
    { symbol: 'ETH/USD',  name: 'Ethereum',   category: 'CRYPTO', decimals: 6 },
    { symbol: 'SOL/USD',  name: 'Solana',     category: 'CRYPTO', decimals: 4 },
    { symbol: 'UNI/USD',  name: 'Uniswap',    category: 'TOKEN',  decimals: 4 },
    { symbol: 'LINK/USD', name: 'Chainlink',  category: 'TOKEN',  decimals: 4 },
    { symbol: 'PUNK/USD', name: 'CryptoPunks (piso)', category: 'NFT', decimals: 0 }
];

module.exports = ASSET_CATALOG;
