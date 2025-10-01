import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, optimismSepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'L2 Scaling Solution',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'placeholder-project-id-for-build',
  chains: [sepolia, optimismSepolia],
  ssr: true,
});
