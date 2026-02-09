import { ethers } from "hardhat";

async function main() {
  // 你的 token 地址（BSC 上的）
  const PAYMENT_TOKEN = process.env.PAYMENT_TOKEN_ADDRESS;

  if (!PAYMENT_TOKEN) {
    throw new Error("请设置 PAYMENT_TOKEN_ADDRESS 环境变量");
  }

  console.log("开始部署 BotBotEscrow...");
  console.log("Payment Token:", PAYMENT_TOKEN);

  const BotBotEscrow = await ethers.getContractFactory("BotBotEscrow");
  const escrow = await BotBotEscrow.deploy(PAYMENT_TOKEN);

  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log("BotBotEscrow 部署成功!");
  console.log("合约地址:", address);
  console.log("");
  console.log("请将此地址添加到 .env 文件:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
