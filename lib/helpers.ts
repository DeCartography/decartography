export async function formatTransactions(
  transactions: any,
  walletAddress: string,
) {
  const formattedTransactions = [];

  for (const transaction of transactions) {
    const isSent =
      transaction.from.toLowerCase() === walletAddress.toLowerCase();
    const type = isSent ? "sent" : "received";
    const amount = parseFloat(transaction.value) / 1e18; // Convert wei to ETH
    const fee =
      (parseFloat(transaction.gasPrice) * parseInt(transaction.gasUsed)) / 1e18; // Convert wei to ETH
    const date = new Date(parseInt(transaction.timeStamp) * 1000).toISOString(); // Convert timestamp to ISO date

    const formattedTransaction = {
      id: transaction.hash,
      type,
      address: isSent ? transaction.to : transaction.from,
      amount,
      fee,
      date,
      blockchain_transaction_id: transaction.hash,
      blockchain_transaction_status:
        transaction.txreceipt_status === "1" ? "confirmed" : "pending",
    };

    formattedTransactions.push(formattedTransaction);
  }

  return formattedTransactions;
}
