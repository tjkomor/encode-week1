import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";
import { Console } from "console";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
    const wallet =
        process.env.MNEMONIC && process.env.MNEMONIC.length > 0
            ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
            : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);

    console.log(`Using address ${wallet.address}`);
    const provider = ethers.providers.getDefaultProvider("ropsten");
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);

    if (balance < 0.01) {
        throw new Error("Not enough ether");
    }

    if (process.argv.length < 3) throw new Error("Ballot address missing");
    const ballotContractAddress = process.argv[2];

    if (process.argv.length < 4) throw new Error("Delegatee address missing");
    const delegateeAddress = process.argv[3];

    console.log(`Ballot address is: ${ballotContractAddress}`);
    console.log(`Delegatee address is: ${delegateeAddress}`);

    console.log(
        `Attaching ballot contract interface to address ${ballotContractAddress}`
    );

    //creating new contract
    const ballotContract: Ballot = new Contract(
        ballotContractAddress,
        ballotJson.abi,
        signer
    ) as Ballot;

    // const deployedBallotContract = await ballotContract.deployed();

    //delegating vote to another voter
    const tx = await ballotContract.delegate(delegateeAddress);
    console.log("Awaiting confirmations");
    const txReceipt = await tx.wait();
    console.log(`Transaction receipt: ${txReceipt}`);
    console.log(`Transaction completed. Hash: ${tx.hash}`);
    console.log(`Successfully delegated to account ${delegateeAddress}!`);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});