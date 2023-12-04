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

// export async function convertDictionaryToArray(dictionary: any) {
//   const resultArray = [];

//   for (const key in dictionary) {
//     const value = dictionary[key];
//     const obj = { address: key, links: value };
//     resultArray.push(obj);
//   }

//   return resultArray;
// }


// // export async function convertDictionaryToArray(jsonResponse: any): Promise<{ address: string; links: string[] }[]> {
//   export async function convertDictionaryToArray(jsonResponse: any): Promise<{ address: string; links: string[]; is_never_selected_address: number }[]> {
//   const rawAddresses = jsonResponse.address_to_raw_uris;
//   // const addresses: { address: string; links: string[] }[] = [];

//   for (const [address, links] of Object.entries(rawAddresses)) {
//     addresses.push({ address, links: links as string[],
//     is_never_selected_address: is_never_selected_address });
//   }

//   return addresses;
// }


// export async function convertDictionaryToArray(jsonResponse: any): Promise<{ address: string; links: string[]; is_never_selected_address: number }[]> {
//   const rawAddresses = jsonResponse.address_to_raw_uris;
//   const addresses: { address: string; links: string[]; is_never_selected_address: number }[] = [];

//   for (const [address, data] of Object.entries(rawAddresses)) {
//     const typedData = data as { raw_uris: string[]; is_never_selected_address: number };
//     addresses.push({ address, links: typedData.raw_uris, is_never_selected_address: typedData.is_never_selected_address });
//   }

//   console.log("convertDictionaryToArray: addresses", addresses)

//   return addresses;
// }

export async function convertDictionaryToArray(jsonResponse: any): Promise<{ address: string; links: string[]; is_never_selected_address: number }[]> {
  const rawAddresses = jsonResponse.address_to_raw_uris;
  const addresses: { address: string; links: string[]; is_never_selected_address: number }[] = [];

  for (const [address, data] of Object.entries(rawAddresses)) {
    if (Array.isArray(data)) {
      addresses.push({ address, links: data, is_never_selected_address: 0 });
    } else {
      const typedData = data as { raw_uris: string[]; is_never_selected_address: number };
      addresses.push({ address, links: typedData.raw_uris, is_never_selected_address: typedData.is_never_selected_address });
    }
  }

  console.log("convertDictionaryToArray: addresses", addresses)

  return addresses;
}
