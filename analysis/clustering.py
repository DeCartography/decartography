# # Given code for data preparation, PCA, and K-means clustering
# from collections import defaultdict
# from sklearn.decomposition import PCA
# from sklearn.cluster import KMeans
# import random
# import pandas as pd
# import sqlite3


# # Connect to the SQLite database
# conn = sqlite3.connect('dc.db')
# cursor = conn.cursor()

# # Execute SQL query to fetch data
# cursor.execute('SELECT * FROM answers')
# db_data = cursor.fetchall()

# # Close the database connection
# conn.close()

# # Convert the database data to a format that can be used for clustering
# data = []
# for row in db_data:
#     user_address = row[1]
#     selected_wallets_str = row[2]
#     created_at = row[3]

#     # Skip rows where 'selected_wallets' is empty
#     if not selected_wallets_str:
#         continue

#     selected_wallets = eval(selected_wallets_str)
#     data.append({
#         "user_address": user_address,
#         "selected_wallets": selected_wallets,
#         "created_at": created_at
#     })


# # Convert the data to a Pandas DataFrame
# df = pd.DataFrame(data)

# # Flatten the 'selected_wallets' lists and create a list of all selected wallet addresses
# all_selected_wallets = []
# for index, row in df.iterrows():
#     for wallet_group in row['selected_wallets']:
#         all_selected_wallets.extend(wallet_group)

# # Create random vectors for each unique wallet address
# address_vectors = {address: [random.uniform(0, 1) for _ in range(
#     5)] for address in set(all_selected_wallets)}

# # Prepare data for PCA
# data_for_pca = [address_vectors[address] for address in all_selected_wallets]

# # Perform PCA
# pca = PCA(n_components=2)
# transformed_data = pca.fit_transform(data_for_pca)

# # Run K-means multiple times and merge the results
# merged_clusters = defaultdict(set)
# for _ in range(2):  # Run K-means 2 times (You can change this number)
#     kmeans = KMeans(n_clusters=5)
#     clusters = kmeans.fit_predict(transformed_data)
#     for i, cluster_id in enumerate(clusters):
#         merged_clusters[all_selected_wallets[i]].add(cluster_id)


# # New code to analyze and display clusters
# clustered_addresses = defaultdict(set)
# for address, cluster_ids in merged_clusters.items():
#     for cluster_id in cluster_ids:
#         clustered_addresses[cluster_id].add(address)


# # 分析対象のアドレス群と、クラスターに属しているアドレスの総数（どちらも重複は消してから比較）が合っているかチェック https://note.nkmk.me/python-list-duplicate-check/
# if len(set(all_selected_wallets)) == len(set(merged_clusters.keys())):{
#     print("`answer`tableのselected_walletsからデータを取得した分析対象のアドレスの数: ",
#           str(len(set(all_selected_wallets))))
# }
# else:
#     print("エラー")


# # Display the new merged cluster analysis, sorted by cluster ID and addresses within each cluster
# # print("\n--- New Cluster Analysis: ---")
# # for cluster_id in sorted(clustered_addresses.keys()):
# #     addresses = sorted(list(clustered_addresses[cluster_id]))
# #     print(f"Cluster {cluster_id}: {addresses}")


# # Display which clusters each address belongs to
# # print("\n--- Which clusters each address belongs to: ---")
# for address, cluster_ids in merged_clusters.items():
#     print(f"{address}: {list(cluster_ids)}")


from typing import List, Dict, Set, Tuple
from collections import defaultdict
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import random
import pandas as pd
import sqlite3


def fetch_db_data(query: str, db_path: str = 'dc.db') -> List[Tuple]:
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(query)
        return cursor.fetchall()


def prepare_data(db_data: List[Tuple]) -> List[Dict]:
    return [{
        "user_address": row[1],
        "selected_wallets": eval(row[2]),
        "created_at": row[3]
    } for row in db_data if row[2]]


def flatten_selected_wallets(data: List[Dict]) -> List[str]:
    return [wallet for row in data for wallet_group in row['selected_wallets'] for wallet in wallet_group]


def create_address_vectors(unique_wallets: Set[str]) -> Dict[str, List[float]]:
    return {address: [random.uniform(0, 1) for _ in range(5)] for address in unique_wallets}


def perform_pca(data: List[List[float]]) -> List[List[float]]:
    pca = PCA(n_components=2)
    return pca.fit_transform(data)


def kmeans_clustering(data: List[List[float]], n_runs: int = 2, n_clusters: int = 5) -> Dict[str, Set[int]]:
    clusters = defaultdict(set)
    for _ in range(n_runs):
        kmeans = KMeans(n_clusters=n_clusters)
        predicted_clusters = kmeans.fit_predict(data)
        for i, cluster_id in enumerate(predicted_clusters):
            clusters[data[i]].add(cluster_id)
    return clusters


def display_clusters(clustered_data: Dict[int, Set[str]]) -> None:
    for cluster_id, addresses in clustered_data.items():
        print(f"Cluster {cluster_id}: {sorted(addresses)}")


# Main analysis function
def analyze_data() -> None:
    raw_data = fetch_db_data('SELECT * FROM answers')
    prepared_data = prepare_data(raw_data)
    all_wallets = flatten_selected_wallets(prepared_data)
    address_vectors = create_address_vectors(set(all_wallets))
    pca_data = perform_pca([address_vectors[address]
                           for address in all_wallets])
    clustered_data = kmeans_clustering(pca_data)
    display_clusters(clustered_data)


# Execute the main function
analyze_data()
