
# import statements
from typing import Tuple, Optional
from typing import List, Dict
from flask import Flask, make_response, request, jsonify, abort, redirect, Response
from flask_cors import CORS
from dotenv import load_dotenv
from collections import Counter
from enum import Enum
import jwt
import json
import os
import requests
import random
import sqlite3
import const
from typing import List

import json
from web3 import Web3, HTTPProvider
import os
from dotenv import load_dotenv

# from web3 import Web3, HTTPProvider
# from ...crypto import claim
# from crypto import claim





load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    #  r"/api/*": {"origins": "https://localhost:3000"}}, supports_credentials=True)
     r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    #  r"/api/*": {"origins": "https://app.localhost:3000"}}, supports_credentials=True)


const.SUBMIT_PASSPORT_URI = "https://api.scorer.gitcoin.co/registry/submit-passport"
const.SIGNING_MESSAGE_URI = "https://api.scorer.gitcoin.co/registry/signing-message"


class TaskState(Enum):
    INITIAL_TASK = 'initial_task'
    SUBSEQUENT_TASK = 'subsequent_task'
    ADDITONAL_TASK = 'additional_task'
    NONE = 'none'


class Address:
    def __init__(self, address: str):
        self.address = address


class CurrentTaskState:
    def __init__(self, TaskState: TaskState, index: int):
        self.TaskState = TaskState
        self.index = index

    def __str__(self):
        return f"CurrentTaskState(TaskState={self.TaskState}, index={self.index})"


class AddressesForTask:
    def __init__(self, addresses: list):
        self.addresses = [Address(address) for address in addresses]


class SubmitPassportRequest:
    def __init__(self, address: Address, community, signature=None, nonce=None):
        self.address = address
        self.community = community
        self.signature = signature
        self.nonce = nonce


class PassportResponse:
    def __init__(self, address: Address, score: int, status, last_score_timestamp, evidence=None, error=None):
        self.address = address
        self.score = score
        self.status = status
        self.last_score_timestamp = last_score_timestamp
        self.evidence = evidence
        self.error = error


@app.route('/ping', methods=['GET'])
def ping_handler():
    return jsonify({"message": "Pong"})


@app.route('/api/signing-message', methods=['GET'])
def signing_message_handler():
    wallet_address = request.args.get("address")

    if not wallet_address:
        return "Please provide a valid wallet address", 400

    headers = {
        "Content-Type": "application/json",
        "X-API-Key": os.environ['GITCOIN_API_KEY']
    }

    try:
        signing_message_resp = requests.get(
            const.SIGNING_MESSAGE_URI, headers=headers)
        signing_message_data = signing_message_resp.json()
        signing_message = signing_message_data.get("message", "")
        return jsonify({"signing_message": signing_message})

    except Exception as e:
        return "Failed to retrieve signing message", 500


@app.route('/api/submit-passport', methods=['POST'])
def submit_handler():
    try:
        data = request.get_json()
        address = data.get("address", "")
        signature = data.get("signature", "")
        nonce = data.get("nonceValue", "")

        if not address or not signature or not nonce:
            return "Invalid fields in the JSON body", 400

        submit_request = SubmitPassportRequest(
            address, os.environ['SCORER_ID'], signature, nonce)
        submit_request_json = json.dumps(submit_request.__dict__)

        headers = {
            "Content-Type": "application/json",
            "X-API-Key": os.environ['GITCOIN_API_KEY']
        }

        submit_resp = requests.post(
            const.SUBMIT_PASSPORT_URI, data=submit_request_json, headers=headers)
        submit_response_data = submit_resp.json()

        if submit_resp.status_code != 200:
            return "Non-OK submit passport response status code", 502

        score = float(submit_response_data.get("score", 0))

        # if score >= 15:
        if score >= 10:  # for debug
            token = generate_jwt_token(address)
            resp = make_response(jsonify({"token": token}))
            resp.set_cookie("_auth", token, secure=True,
                            httponly=False, samesite='None')

            return resp
        else:
            return f"Score is not enough: {score}", 403
            # todo: スコアが足りないことを明示的に通知する&&リダイレクトなどを案内する

    except Exception as e:
        return "Failed to process the request", 500


def generate_jwt_token(address: Address):
    payload = {"address": address}
    secret = os.environ['AUTH_KEY']
    algorithm = "HS256"
    token = jwt.encode(payload, secret, algorithm=algorithm)
    return token


@app.route('/api/set-auth-cookie', methods=['POST'])
def set_auth_cookie():
    print("API: set_auth_cookie was triggersed")
    try:
        data = request.get_json()
        token = data.get("token", "")
        address = data.get("address", "")

        if not token or not address:
            return "Token and address are required", 400

        resp = make_response("Cookies set")
        resp.set_cookie("_auth", token, secure=True,
                        httponly=False, samesite='None')
        resp.set_cookie("address", address, secure=True,
                        httponly=False, samesite='None')

        return resp

    except Exception as e:
        return "Failed to set cookies", 500


@app.route('/api/get-txs', methods=['GET'])
def ethereum_transactions_handler():
    address = request.args.get('address')

    if not address:
        abort(400, description="Ethereum address is required as a query parameter")

    api_url = f"https://api.etherscan.io/api?module=account&action=txlist&address={address}&sort=desc&apikey={os.environ['ETHERSCAN_API_KEY']}"

    try:
        resp = requests.get(api_url)
    except Exception as e:
        abort(500, description="Failed to fetch Ethereum transactions")

    if resp.status_code != 200:
        abort(502, description="Non-OK Etherscan API response status code")

    try:
        transactions = resp.json()
    except Exception as e:
        abort(500, description="Failed to decode Etherscan API response")

    return jsonify(transactions)


@app.route('/api/get-eth', methods=['GET'])
def ether_balance_handler():
    address = request.args.get('address')

    if not address:
        abort(400, description="Ethereum address is required as a query parameter")

    api_url = f"https://api.etherscan.io/api?module=account&action=balance&address={address}&tag=latest&apikey={os.environ['ETHERSCAN_API_KEY']}"

    try:
        resp = requests.get(api_url)
    except Exception as e:
        abort(500, description="Failed to fetch Ether balance")

    if resp.status_code != 200:
        abort(502, description="Non-OK Etherscan API response status code")

    try:
        balance_response = resp.json()
    except Exception as e:
        abort(500, description="Failed to decode Etherscan API response")

    if balance_response.get('status') == '0':
        abort(400, description=balance_response.get('message'))

    balance = balance_response.get('result')

    return jsonify({"balance": balance})


@app.route('/api/get-passport-score', methods=['GET'])
def get_passport_score_handler():
    current_address = request.args.get('address')

    if not current_address:
        abort(400, description="Address is required as a query parameter")

    GET_PASSPORT_SCORE_URI = f"https://api.scorer.gitcoin.co/registry/score/{os.environ['SCORER_ID']}/{current_address}"

    headers = {
        "Content-Type": "application/json",
        "X-API-Key": os.environ['GITCOIN_API_KEY']
    }

    try:
        resp = requests.get(GET_PASSPORT_SCORE_URI, headers=headers)
    except Exception as e:
        abort(500, description="Failed to make Gitcoin Passport API request")

    if resp.status_code != 200:
        abort(502, description="Non-OK Gitcoin Passport API response status code")

    try:
        passport_data = resp.json()
    except Exception as e:
        abort(500, description="Failed to decode Gitcoin Passport API response")

    score_str = passport_data.get('score')

    if score_str:
        try:
            score = float(score_str)
            rounded_score = round(score * 100) / 100
        except ValueError:
            abort(500, description="Failed to convert score to numeric value")

        return jsonify({"score": rounded_score})
    else:
        return jsonify({"message": "No score available, please add Stamps to your passport and then resubmit."})


# @app.route('/api/get-addresses', methods=['GET']) #タスク生成のAPIエンドポイント
# def get_addresses_and_nfts_handler():

#     filepath = "./backend_app/static/mvp_addresses30file.json" #分析対象のウォレットアドレスがあるファイルパス
#     filename = os.path.basename(filepath).split("~")[0]

#     # フロント側から叩くURLがamount_paramを持っている、デフォルトは`6`
#     amount_param = request.args.get('amount', default=0, type=int)
#     if amount_param <= 0:
#         return jsonify(error="Invalid amount parameter"), 400
#     is_swap = request.args.get('is_swap', default='false').lower() == 'true'

#     # 分析対象のファイルからアドレスを抜きだす
#     try:
#         with open(filepath, 'r') as f:
#             addresses = json.load(f)
#     except FileNotFoundError:
#         return jsonify(error="Failed to read addresses file"), 500

#     if len(addresses) < amount_param:
#         return jsonify(error="Not enough addresses available"), 400

#     # dc.dbにアクセスしてTaskStateというテーブルからis_initial_taskとinitial_task_indexを取得し、inital_taskを生成するべきか判断する
#     conn = sqlite3.connect('dc.db')
#     cursor = conn.cursor()
#     cursor.execute(
#         "SELECT Is_initial_task, initial_task_index, subsequent_task_index FROM TaskState")
#     row = cursor.fetchone()
#     print("APIが叩かれた時点の`TaskState`DBの中身: ", row)  # debug

#     if row:
#         is_initial_task = row[0]
#         initial_task_index = row[1]

#     else:
#         is_initial_task = 1
#         initial_task_index = 0
#         print("現在分析対象に設定されているデータが分析対象になるのは初めてなので、最初に出題するのはinitial_taskからにします。")  # debug
#         print("分析対象のファイル名: " + filename + ", 対象アドレスの総数: " +str(len(addresses)))  # debug
#         print("ここから作れるInitial_taskの総数: " + str(len(addresses) // 6))  # debug

#     # initial_taskフラグがtrueな場合:
#     if is_initial_task:
#         if is_swap:
#             addresses_for_task = random.sample(addresses, k=amount_param)
#             print("Initial_task内でSwapされました")
#         else:
#             print("現在" + str(initial_task_index+1) + "個目のタスクを生成中。")
#             print("トータルのinitial_taskの数: " + str(len(addresses) // 6) + "/ 現在のindex: " + str(initial_task_index+1))

#             # 分析対象のcsvから、6個づつアドレスを取り出し1つのタスクにする。具体的には分析対象のCSVが30個のアドレスを持っている場合（mvp_addresses30file.json）、initial_taskは5個作れる。
#             all_initial_tasks = [addresses[i:i+6]for i in range(0, len(addresses), 6)]

#             addresses_for_task = all_initial_tasks[initial_task_index]
#             initial_task_index += 1  # all_initial_tasksに対して毎回+1してタスクを取り出す

#             # 出題候補であるall_initial_tasksの中身を全部使い切った時、is_initial_taskをfalseにする
#             if initial_task_index >= len(all_initial_tasks):
#                 is_initial_task = 0
#                 initial_task_index = 0
#                 print("initial_taskを使い切ったので、次からはsubsequent_taskになります")

#             if row:
#                 # rowが存在する場合、TaskStateテーブルのis_initial_taskとinitial_task_indexを更新します
#                 cursor.execute("UPDATE TaskState SET is_initial_task=?, initial_task_index=?",(is_initial_task, initial_task_index))
#             else:
#                 # rowが存在しない場合、TaskStateテーブルに新しいレコードを挿入します
#                 cursor.execute("INSERT INTO TaskState (is_initial_task, initial_task_index) VALUES (?, ?)",(is_initial_task, initial_task_index))
#                 print("TableStateの中身が空だったので、中身を入れておきました")
#             conn.commit()

#     # initial_taskフラグがfalseな場合（subsequent_taskを開始する）:
#     elif not is_initial_task:
#         # 一旦TaskStateを確認して、これが初めてのsubsequent_taskか確認
#         cursor.execute(
#             "SELECT Is_initial_task, initial_task_index, subsequent_task_index FROM TaskState")
#         row = cursor.fetchone()
#         # 初回でなく、すでにあればそれを使って欲しいんだけど...
#         if row[2] is not None:
#             subsequent_task_index = row[2]
#         # ない場合は作る、subsequent_task_indexに`0`を入れる。前まで使っていたis_initial_taskとinitial_task_indexは消しちゃって大丈夫。
#         else:
#             subsequent_task_index = 0
#             cursor.execute(
#                 "UPDATE TaskState SET is_initial_task=0, initial_task_index=0, subsequent_task_index=?", (subsequent_task_index,))
#             print("subsequent_task_indexが空だったので、中身を入れておきました")

#         # initial_taskの回答からsubsequent_taskを生成するために、DBの中からis_initial_taskがtrueのものだけを取得する
#         cursor.execute(
#             "SELECT selected_wallets, Is_initial_task FROM answers WHERE is_initial_task = 1")
#             #result:  [["0x1bc5ebee4738fd95bd96751c45a90889f772e0f3", "0x76f69dcddd0593b0aff5fd3280c3433ddb68e0d2", "0x8f8a255c64ec0109092674a7219f4d10f625e788"], ["0x2342e0debeffc7765ed5e771e18e96068f38d3a4", "0x88f74515cb136609eaa538f71c0e7dadd537d594", "0x9437fe6385f3551850fd892d471ffbc818cf3116"], ["0x1bc5ebee4738fd95bd96751c45a90889f772e0f3", "0x76f69dcddd0593b0aff5fd3280c3433ddb68e0d2", "0x8f8a255c64ec0109092674a7219f4d10f625e788"]]|1[["0x5c1c33cd2118179d927255bde59313faca3ed0f0", "0x8ae26c6145a5484c48fd902a9ccb83368a57c01c", "0xd9ed76e589e6dad7446e3b40b197243b55d15e28"], ["0x5c1c33cd2118179d927255bde59313faca3ed0f0", "0x8ae26c6145a5484c48fd902a9ccb83368a57c01c", "0xd9ed76e589e6dad7446e3b40b197243b55d15e28"], ["0x5c1c33cd2118179d927255bde59313faca3ed0f0", "0x8ae26c6145a5484c48fd902a9ccb83368a57c01c", "0xd9ed76e589e6dad7446e3b40b197243b55d15e28"]]|1[["0x201b856fe2d5539cbd325cd2c491ca75e4dfa2e7", "0xa05f6510f6bbb0e8ba341d5a21669fa9c0deaaf4", "0xaa0bd73e75aeef544d80df25790ba307aeea7c08"], ["0x201b856fe2d5539cbd325cd2c491ca75e4dfa2e7", "0xa05f6510f6bbb0e8ba341d5a21669fa9c0deaaf4", "0xaa0bd73e75aeef544d80df25790ba307aeea7c08"], ["0x201b856fe2d5539cbd325cd2c491ca75e4dfa2e7", "0xe1e20964542e740e496fd5e87e9dba77a073ff6d", "0xa05f6510f6bbb0e8ba341d5a21669fa9c0deaaf4"]]|1
#         rows = cursor.fetchall()

#         all_selected_addresses = [
#             address for row in rows if row[1] for address in json.loads(row[0])]  # 今までinitial_taskで選ばれたアドレスのリスト

#         all_selected_addresses = [tuple(address)for address in all_selected_addresses] # 重複を除くためにtupleに変換

#         address_count = Counter(all_selected_addresses)

#         # 各クラウドワーカーが選択したウォレットアドレスの出現回数を集計し、出現回数が最も多いウォレットアドレスをgolden_standardにする
#         golden_standard = address_count.most_common(1)[0][0]

#         all_subsequent_tasks = []

#         # golden_standardに近いアドレスをsubsequent_tasksにする
#         for address in golden_standard:
#             index = addresses.index(address)
#             addresses_for_task = addresses[max(0, index - 2):index + 4]
#             if len(addresses_for_task) < 6:
#                 shortfall = 6 - len(addresses_for_task)
#                 if index - 2 > 0:  # 左側にスペースがある場合
#                     addresses_for_task = addresses[max(
#                         0, index - 2 - shortfall):index + 4]
#                 else:  # 右側にスペースがある、またはaddresses自体が短い場合
#                     addresses_for_task.extend(
#                         addresses[index + 4:index + 4 + shortfall])
#             all_subsequent_tasks.append(addresses_for_task)

#         if is_swap:
#             addresses_for_task = random.sample(
#                                 all_selected_addresses, k=amount_param)
#             print("subsequent_task内でSwapされました")

#         else:
#             print("トータルのSubsequentTaskの数: " + str(len(all_subsequent_tasks)) +"/ 現在のindex: " + str(subsequent_task_index+1))

#             # subsequent_task_indexがall_subsequent_tasksの範囲を超えないようにします
#             if subsequent_task_index < len(all_subsequent_tasks):
#                 addresses_for_task = all_subsequent_tasks[subsequent_task_index]
#                 subsequent_task_index += 1
#                 # DB側のsubsequent_task_indexを更新
#                 cursor.execute("UPDATE TaskState SET subsequent_task_index=?",(subsequent_task_index,))
#                 print("subsequent_task_indexを更新しました")
#                 conn.commit()

#             else:  # 超えた場合は、subsequent_taskが終了したということ

#                 # このままだと「タスクとしては出題されているけど、一度も選択されていない（selected_walletesに存在しない）アドレスがあるので、その状態を避けたい

#                 # 現状の回答DBの中身を確認
#                 cursor.execute("SELECT selected_wallets FROM answers")
#                 all_selected_addresses_in_db = [
#                     address for row in cursor.fetchall() for address in json.loads(row[0])]
#                 flat_list = [
#                     item for sublist in all_selected_addresses_in_db for item in sublist]

#                 if set(flat_list) == set(addresses):  # すべてのアドレスが一度は回答に選択されたら、全てのタスク生成プロセスを終了
#                     print("全てのアドレスを分析し切りました。")
#                     # このログが出ている場合、DB: answer tableにデータが入りすぎている。なお、ダッシュボードから「Start now」を押すとUnhandled Runtime ErrorTypeError: Cannot read properties of undefined(reading 'length')と表示される。
#                     # https://scrapbox.io/tkgshn-private/%E5%8E%9F%E5%9B%A0%E8%A7%A3%E6%98%8E%E6%B8%88%E3%81%BF:_%E3%83%80%E3%83%83%E3%82%B7%E3%83%A5%E3%83%9C%E3%83%BC%E3%83%89%E3%81%8B%E3%82%89%22Start_now%22%E3%81%A7%E3%82%BF%E3%82%B9%E3%82%AF%E3%82%92%E9%96%8B%E5%A7%8B%E3%81%99%E3%82%8B%E3%81%A8%E3%80%81_Unhandled_Runtime_Error_TypeError:_Cannot_read_properties_of_undefined_(reading_'length')_%E3%81%8C%E5%87%BA%E3%82%8B#6548687809c5f20000445eb0

#                     # ここでクラスタリング分析するanalysis/clustering.pyを走らせる
#                     import subprocess
#                     subprocess.run(["/opt/homebrew/bin/python3","analysis/clustering.py"])
#                     print("終了処理はPythonでできないので、フロント側に対してAPIを叩いたりして処理する") #todo

#                     return #ここで終了させるとどうなる？

#                 else: # 分析対象のアドレスとしては存在するけど、まだ回答DBにはないアドレスがある場合
#                     print("最終タスクの生成")

#                     is_never_selected_address = set(addresses) - set(flat_list) # 一度も選択されたことのないアドレス群
#                     print("今まで一度も選択されたことのないアドレスの数", len(is_never_selected_address))
#                     is_never_selected_address = list(is_never_selected_address)

#                     additional_task_index = 0

#                     # TaskStateを確認して、最終タスクが初めてかどうかを確認
#                     cursor.execute(
#                         "SELECT additional FROM TaskState")
#                     row = cursor.fetchone()

#                     if row[0] is not None:  # あればそれを使って欲しいんだけど...
#                         additional_task_index = row[0]

#                     else:  # ない場合は、作って欲しい。前まで使っていたis_initial_taskとinitial_task_indexは消しちゃって大丈夫。
#                         additional_task_index = 0
#                         cursor.execute(
#                             "UPDATE TaskState SET is_initial_task=0, initial_task_index=0, subsequent_task_index=0, additional_task_index=?", (additional_task_index,))
#                         print("unselected_addresses_indexが空だったので、中身を入れておきました")

#                     # `fetch_nfts`にアドレスを渡せばNFTのURIを取得できる
#                     def fetch_nfts(address):
#                         alchemy_url = f"https://eth-mainnet.g.alchemy.com/nft/v3/{os.environ['ALCHEMY_API_KEY']}/getNFTsForOwner?owner={address}&withMetadata=true&pageKey=1&pageSize=10"
#                         response = requests.get(alchemy_url)
#                         if response.status_code != 200:
#                             return jsonify(error="Failed to fetch NFTs"), 500
#                         alchemy_response = response.json()
#                         raw_uris = [owned_nft['contract']['openSeaMetadata']['imageUrl'] for owned_nft in alchemy_response['ownedNfts']
#                                     if 'openSeaMetadata' in owned_nft['contract'] and 'imageUrl' in owned_nft['contract']['openSeaMetadata']]
#                         return raw_uris

#                     # もしadditonal taskの最中にswapが押されただけであれば、getNFTs(5)と来た場合は多分ただのswapであると判断するべき
#                     # すでに押されているもの+個人的な選択の場合は、amount_paramが4になる
#                     if is_swap:
#                         print("additonal task中でのswapは、unselected_addressを含めないものをaddress_to_raw_urisとしてデリバリーします")
#                         addresses_for_task = random.sample(flat_list, 6)  # all_selected_addresses_in_db（すでに回答DBに存在しているアドレス）から5個選ぶ


#                         address_to_raw_uris = {}
#                         for address in addresses_for_task:
#                             address_to_raw_uris[address] = fetch_nfts(address)
#                         # return jsonify({
#                         #     "address_to_raw_uris": {
#                         #         never_selected_address: {  # 最終ラウンドでは必ず1つはunselected_addressを選択肢に含むこと
#                         #             "raw_uris": fetch_nfts(never_selected_address),
#                         #             "is_never_selected_address": 1  # このフラグがtrue（1）な場合は、選択肢として表示される瞬間からすでに選択済みになっている
#                         #         },
#                         #         **{
#                         #             address: {
#                         #                 "raw_uris": fetch_nfts(address),
#                         #                 "is_never_selected_address": 0
#                         #             } for address in addresses_for_task
#                         #         }
#                         #     },
#                         #     "is_initial_task": 0
#                         # }), 200

#                         print("Additonal Taskでswap使った時のaddress_to_raw_uris",
#                             address_to_raw_uris)

#                         # return jsonify({"address_to_raw_uris": address_to_raw_uris, "is_initial_task": is_initial_task}), 200

#                         return jsonify({
#                             "address_to_raw_uris": {
#                                 **{
#                                     address: {
#                                         "raw_uris": fetch_nfts(address),
#                                         "is_never_selected_address": 0
#                                     } for address in addresses_for_task
#                                 }
#                             },
#                             "is_initial_task": 0
#                         }), 200

#                     else:
#                         print("unselected_addressを含めたものをaddress_to_raw_urisとしてデリバリーします")
#                         never_selected_address = is_never_selected_address.pop(0)  # unselected_addressesの一番最初を取得
#                         remaining_addresses = set(addresses) - {never_selected_address}
#                         addresses_for_task = random.sample(list(remaining_addresses), 5)


#                         address_to_raw_uris = {}

#                         # # `fetch_nfts`にアドレスを渡せばNFTのURIを取得できる
#                         # def fetch_nfts(address):
#                         #     alchemy_url = f"https://eth-mainnet.g.alchemy.com/nft/v3/{os.environ['ALCHEMY_API_KEY']}/getNFTsForOwner?owner={address}&withMetadata=true&pageKey=1&pageSize=10"
#                         #     response = requests.get(alchemy_url)
#                         #     if response.status_code != 200:
#                         #         return jsonify(error="Failed to fetch NFTs"), 500
#                         #     alchemy_response = response.json()
#                         #     raw_uris = [owned_nft['contract']['openSeaMetadata']['imageUrl'] for owned_nft in alchemy_response['ownedNfts']
#                         #                 if 'openSeaMetadata' in owned_nft['contract'] and 'imageUrl' in owned_nft['contract']['openSeaMetadata']]
#                         #     return raw_uris

#                         for address in addresses_for_task:
#                             address_to_raw_uris[address] = fetch_nfts(address)

#                         additional_task_index += 1
#                         cursor.execute("UPDATE TaskState SET additional_task_index=?",(additional_task_index,))
#                         print("unselected_addresses_indexを更新しました")
#                         conn.commit()

#                         print("Additonal Taskの通常address_to_raw_uris",
#                             address_to_raw_uris)

#                         print("これが無駄に動いている気がする")

#                         return jsonify({
#                             "address_to_raw_uris": {
#                                 never_selected_address: { #最終ラウンドでは必ず1つはunselected_addressを選択肢に含むこと
#                                     "raw_uris": fetch_nfts(never_selected_address),
#                                     "is_never_selected_address": 1 # このフラグがtrue（1）な場合は、選択肢として表示される瞬間からすでに選択済みになっている
#                                 },
#                                 **{
#                                     address: {
#                                         "raw_uris": fetch_nfts(address),
#                                         "is_never_selected_address": 0
#                                     } for address in addresses_for_task
#                                 }
#                             },
#                             "is_initial_task": 0
#                         }), 200

#     conn.close()

#     address_to_raw_uris = {}
#     for address in addresses_for_task:
#         alchemy_url = f"https://eth-mainnet.g.alchemy.com/nft/v3/{os.environ['ALCHEMY_API_KEY']}/getNFTsForOwner?owner={address}&withMetadata=true&pageKey=1&pageSize=10"
#         response = requests.get(alchemy_url)
#         if response.status_code != 200:
#             return jsonify(error="Failed to fetch NFTs"), 500
#         alchemy_response = response.json()
#         raw_uris = [owned_nft['contract']['openSeaMetadata']['imageUrl'] for owned_nft in alchemy_response['ownedNfts']
#                     if 'openSeaMetadata' in owned_nft['contract'] and 'imageUrl' in owned_nft['contract']['openSeaMetadata']]
#         address_to_raw_uris[address] = raw_uris
#     return jsonify({"address_to_raw_uris": address_to_raw_uris, "is_initial_task": is_initial_task}), 200


def fetch_nfts(address: Address) -> List[str]: #アドレスを渡せばNFTのURIを含むlistが取得できる
    alchemy_url = f"https://eth-mainnet.g.alchemy.com/nft/v3/{os.environ['ALCHEMY_API_KEY']}/getNFTsForOwner?owner={address}&withMetadata=true&pageKey=1&pageSize=10"
    response = requests.get(alchemy_url)
    if response.status_code != 200:
        return []
    alchemy_response = response.json()
    return [owned_nft['contract']['openSeaMetadata']['imageUrl'] for owned_nft in alchemy_response['ownedNfts']
            if 'openSeaMetadata' in owned_nft['contract'] and 'imageUrl' in owned_nft['contract']['openSeaMetadata']]


# def fetch_nfts(address: Address) -> List[str]:

#     alchemy_url = f"https://eth-mainnet.g.alchemy.com/nft/v3/{os.environ['ALCHEMY_API_KEY']}/getNFTsForOwner?owner={address}&withMetadata=true&pageKey=1&pageSize=10"
#     alchemy_response = get_response(alchemy_url)

#     def get_response(url: str) -> Dict:
#         response = requests.get(url)
#         return response.json() if response.status_code == 200 else None

#     def extract_image_urls(nfts: Dict) -> List[str]:
#         return [
#             nft['contract']['openSeaMetadata']['imageUrl']
#             for nft in nfts.get('ownedNfts', [])
#             if 'openSeaMetadata' in nft['contract'] and 'imageUrl' in nft['contract']['openSeaMetadata']
#         ]

#     return extract_image_urls(alchemy_response) if alchemy_response else []



# def get_task_state_from_db(cursor) -> CurrentTaskState: #DBからTaskStateを取得する
#     cursor.execute(
#         "SELECT is_initial_task, initial_task_index, subsequent_task_index, additional_task_index FROM TaskState")
#     row = cursor.fetchone()
#     # cursor.connection.close()
#     print("get_task_state_from_dbの中身: ", row)

#     if row is not None:
#         if row[0] == True:  # もしis_initial_taskがtrueならば:
#             return CurrentTaskState(TaskState.INITIAL_TASK, row[1])
#         # elif row[2] is not None:
#         elif row[3] is None:  # additonal_task_indexがまだ作られていなければ:
#             return CurrentTaskState(TaskState.SUBSEQUENT_TASK, row[2])
#         else:  # それ以外の場合はadditonal_task_indexが作られているので、そこから取得する
#             return CurrentTaskState(TaskState.ADDITONAL_TASK, row[3])

#     else:  # TaskStateの中身が何もない場合は初期化する
#         # cursor.execute(
#         #     "UPDATE TaskState SET is_initial_task=1, initial_task_index=0",)
#         # cursor.execute("INSERT INTO TaskState (is_initial_task=1, initial_task_index=0")
#         cursor.execute("INSERT INTO TaskState (is_initial_task, initial_task_index) VALUES (?, ?)",
#                        (1, 0))
#         cursor.connection.commit()
#         # cursor.connection.close()
#         return CurrentTaskState(TaskState.INITIAL_TASK, 0)


def get_task_state_from_db(cursor) -> CurrentTaskState:
    def fetch_task_state(cursor) -> Optional[Tuple]:
        cursor.execute(
            "SELECT is_initial_task, initial_task_index, subsequent_task_index, additional_task_index FROM TaskState")
        return cursor.fetchone()

    def determine_task_state(row: Tuple) -> CurrentTaskState:
        if row[0] == True:
            return CurrentTaskState(TaskState.INITIAL_TASK, row[1])
        elif row[3] is None:
            return CurrentTaskState(TaskState.SUBSEQUENT_TASK, row[2])
        else:
            return CurrentTaskState(TaskState.ADDITONAL_TASK, row[3])

    def initialize_task_state(cursor):
        cursor.execute(
            "INSERT INTO TaskState (is_initial_task, initial_task_index) VALUES (?, ?)", (1, 0))
        cursor.connection.commit()

    row = fetch_task_state(cursor)

    if row is not None:
        return determine_task_state(row)
    else:
        initialize_task_state(cursor)
        return CurrentTaskState(TaskState.INITIAL_TASK, 0)



# def update_task_state_to_db(cursor, is_initial_task, initial_task_index, subsequent_task_index, additional_task_index):
#     cursor.execute("UPDATE TaskState SET is_initial_task=?, initial_task_index=?, subsequent_task_index=?, additional_task_index=?",(is_initial_task, initial_task_index, subsequent_task_index, additional_task_index))
#     cursor.connection.commit()

# def update_task_state_to_db(cursor, is_initial_task: bool, task_state: TaskState, index: int):
#     print("update_task_state_to_dbの発火")
#     if is_initial_task == True:
#         cursor.execute(
#             "UPDATE TaskState SET is_initial_task=?, initial_task_index=?", (True, index))
#     if task_state == TaskState.INITIAL_TASK:
#         cursor.execute(
#             "UPDATE TaskState SET is_initial_task=?, initial_task_index=?", (True, index))
#     elif task_state == TaskState.SUBSEQUENT_TASK:
#         cursor.execute(
#             "UPDATE TaskState SET is_initial_task=?, subsequent_task_index=?", (False, index))
#     elif task_state == TaskState.ADDITONAL_TASK:
#         cursor.execute(
#             "UPDATE TaskState SET is_initial_task=?, additional_task_index=?", (False, index))
#     else:
#         raise ValueError("Invalid task state")

#     # データベースの変更をコミット
#     cursor.connection.commit()
#     cursor.connection.close()

def update_task_state_to_db(cursor, is_initial_task: bool, task_state: TaskState, index: int):
    def update_initial_task(cursor, index):
        cursor.execute(
            "UPDATE TaskState SET is_initial_task=?, initial_task_index=?", (True, index))

    def update_subsequent_task(cursor, index):
        cursor.execute(
            "UPDATE TaskState SET is_initial_task=?, subsequent_task_index=?", (False, index))

    def update_additional_task(cursor, index):
        cursor.execute(
            "UPDATE TaskState SET is_initial_task=?, additional_task_index=?", (False, index))

    print("update_task_state_to_dbの発火")

    if is_initial_task or task_state == TaskState.INITIAL_TASK:
        update_initial_task(cursor, index)
    elif task_state == TaskState.SUBSEQUENT_TASK:
        update_subsequent_task(cursor, index)
    elif task_state == TaskState.ADDITONAL_TASK:
        update_additional_task(cursor, index)
    else:
        raise ValueError("Invalid task state")

    cursor.connection.commit()
    cursor.connection.close()



# def create_initial_task(cursor, addresses: list, CurrentTaskState: CurrentTaskState, amount_param: int, is_swap: bool) -> AddressesForTask:
#     print("create_intiial_task関数の実行")

#     const.is_initial_task: bool = True

#     addresses_for_task = random.sample(addresses, k=amount_param) if is_swap else (
#         # addressesを6つずつに分割したものをall_initial_tasksに格納
#         all_initial_tasks := [addresses[i:i+6] for i in range(0, len(addresses), 6)],
#         # all_initial_tasksから現在のindexに対応するアドレスを取得
#         addresses_for_task := all_initial_tasks[CurrentTaskState.index],
#         CurrentTaskState.index += 1,
#         # 出題候補であるall_initial_tasksの中身を全部使い切った時、is_initial_taskをfalseにする
#         is_initial_task := False if CurrentTaskState.index >= len(all_initial_tasks) else True,
#         CurrentTaskState.index=0 if not is_initial_task else CurrentTaskState.index,
#         CurrentTaskState.TaskState=TaskState.SUBSEQUENT_TASK if not is_initial_task else CurrentTaskState.TaskState,
#         update_task_state_to_db(cursor, is_initial_task=is_initial_task,
#                                 task_state=CurrentTaskState.TaskState, index=CurrentTaskState.index),
#         print("これが最後のinitial_taskなので、次からはsubsequent_taskになります") if not is_initial_task else print(
#             "update_task_state_to_dbに対して" + str(CurrentTaskState.TaskState) + "と" + str(CurrentTaskState.index) + "を渡しました"),
#         addresses_for_task
#     )[4]  # addresses_for_taskを返す

#     return addresses_for_task

def create_initial_task(cursor, addresses: list, CurrentTaskState: CurrentTaskState, amount_param: int, is_swap: bool) -> AddressesForTask:
    print("create_initial_task関数の実行")

    if is_swap:
        return random.sample(addresses, k=amount_param)

    else:
        # addressesを6つずつに分割
        all_initial_tasks = [addresses[i:i+6] for i in range(0, len(addresses), 6)]
        addresses_for_task = all_initial_tasks[CurrentTaskState.index]
        CurrentTaskState.index += 1

        # 出題候補を全部使い切った時の処理
        if CurrentTaskState.index >= len(all_initial_tasks):
            CurrentTaskState.index = 0
            CurrentTaskState.TaskState = TaskState.SUBSEQUENT_TASK
            update_task_state_to_db(cursor, is_initial_task=False,
                                    task_state=CurrentTaskState.TaskState, index=CurrentTaskState.index)
            print("これが最後のinitial_taskなので、次からはsubsequent_taskになります")
        else:
            update_task_state_to_db(cursor, is_initial_task=True,
                                    task_state=CurrentTaskState.TaskState, index=CurrentTaskState.index)
            print("update_task_state_to_dbに対して" + str(CurrentTaskState.TaskState) +
                "と" + str(CurrentTaskState.index) + "を渡しました")

        return addresses_for_task




    # addresses_for_task = random.sample(addresses, k=amount_param) if is_swap else

    # # is_swap
    # # ? random.sample(addresses, k=amount_param)

    # if is_swap:
    #     addresses_for_task: AddressesForTask = random.sample(
    #         addresses, k=amount_param)
    #     print("Initial_task内でSwapされました")
    #     return addresses_for_task

    # else:
    #     # addressesを6つずつに分割したものをall_initial_tasksに格納
    #     all_initial_tasks = [addresses[i:i+6]
    #                          for i in range(0, len(addresses), 6)]
    #     # 例: all_initial_tasks = [[address1, address2, address3, address4, address5, address6], [address7, address8, address9, address10, address11, address12], ...]

    #     addresses_for_task: AddressesForTask = all_initial_tasks[CurrentTaskState.index]
    #     CurrentTaskState.index += 1

    #     # 出題候補であるall_initial_tasksの中身を全部使い切った時、is_initial_taskをfalseにする
    #     if CurrentTaskState.index >= len(all_initial_tasks):
    #         is_initial_task: bool = False
    #         CurrentTaskState.index = 0
    #         CurrentTaskState.TaskState = TaskState.SUBSEQUENT_TASK
    #         update_task_state_to_db(cursor, is_initial_task=is_initial_task,
    #                                 task_state=CurrentTaskState.TaskState, index=CurrentTaskState.index)
    #         print("これが最後のinitial_taskなので、次からはsubsequent_taskになります")
    #         return addresses_for_task
    #         # return

    #     else:
    #         update_task_state_to_db(cursor, is_initial_task=is_initial_task,
    #                                 task_state=CurrentTaskState.TaskState, index=CurrentTaskState.index)
    #         print("update_task_state_to_dbに対して" + str(CurrentTaskState.TaskState) +
    #               "と" + str(CurrentTaskState.index) + "を渡しました")
    #     return addresses_for_task


def create_subsequent_task(cursor, addresses: list, CurrentTaskState: CurrentTaskState,  amount_param: int, is_swap: bool) -> AddressesForTask:

    print("create_subsequent_task関数の実行")

    def fetch_collected_answer(cousor) -> List:
        # initial_taskの回答からsubsequent_taskを生成するために、DBの中からis_initial_taskがtrueのものだけを取得する
        cursor.execute(
            "SELECT selected_wallets, Is_initial_task FROM answers WHERE is_initial_task = 1")
        # result:  [["0x1bc5ebee4738fd95bd96751c45a90889f772e0f3", "0x76f69dcddd0593b0aff5fd3280c3433ddb68e0d2", "0x8f8a255c64ec0109092674a7219f4d10f625e788"], ["0x2342e0debeffc7765ed5e771e18e96068f38d3a4", "0x88f74515cb136609eaa538f71c0e7dadd537d594", "0x9437fe6385f3551850fd892d471ffbc818cf3116"], ["0x1bc5ebee4738fd95bd96751c45a90889f772e0f3", "0x76f69dcddd0593b0aff5fd3280c3433ddb68e0d2", "0x8f8a255c64ec0109092674a7219f4d10f625e788"]]|1[["0x5c1c33cd2118179d927255bde59313faca3ed0f0", "0x8ae26c6145a5484c48fd902a9ccb83368a57c01c", "0xd9ed76e589e6dad7446e3b40b197243b55d15e28"], ["0x5c1c33cd2118179d927255bde59313faca3ed0f0", "0x8ae26c6145a5484c48fd902a9ccb83368a57c01c", "0xd9ed76e589e6dad7446e3b40b197243b55d15e28"], ["0x5c1c33cd2118179d927255bde59313faca3ed0f0", "0x8ae26c6145a5484c48fd902a9ccb83368a57c01c", "0xd9ed76e589e6dad7446e3b40b197243b55d15e28"]]|1[["0x201b856fe2d5539cbd325cd2c491ca75e4dfa2e7", "0xa05f6510f6bbb0e8ba341d5a21669fa9c0deaaf4", "0xaa0bd73e75aeef544d80df25790ba307aeea7c08"], ["0x201b856fe2d5539cbd325cd2c491ca75e4dfa2e7", "0xa05f6510f6bbb0e8ba341d5a21669fa9c0deaaf4", "0xaa0bd73e75aeef544d80df25790ba307aeea7c08"], ["0x201b856fe2d5539cbd325cd2c491ca75e4dfa2e7", "0xe1e20964542e740e496fd5e87e9dba77a073ff6d", "0xa05f6510f6bbb0e8ba341d5a21669fa9c0deaaf4"]]|1
        return cursor.fetchall()

    def calculate_golden_standard(collected_answer_as_initial_task) -> List:
        rows = collected_answer_as_initial_task
        all_selected_addresses = [
            address for row in rows if row[1] for address in json.loads(row[0])]  # 今までinitial_taskで選ばれたアドレスのリスト
        address_count = Counter(tuple(address)
                            for address in all_selected_addresses)

        # 各クラウドワーカーが選択したウォレットアドレスの出現回数を集計し、出現回数が最も多いウォレットアドレスをgolden_standardにする
        golden_standard = address_count.most_common(1)[0][0]
        return golden_standard

    def generate_subsequent_tasks(addresses, golden_standard)-> List:
        all_subsequent_tasks = []
        # golden_standardに近いアドレスをsubsequent_tasksにする
        for address in golden_standard:
            index = addresses.index(address)
            addresses_for_task = addresses[max(0, index - 2):index + 4]
            if len(addresses_for_task) < 6:
                shortfall = 6 - len(addresses_for_task)
                if index - 2 > 0:  # 左側にスペースがある場合
                    addresses_for_task = addresses[max(
                        0, index - 2 - shortfall):index + 4]
                else:  # 右側にスペースがある、またはaddresses自体が短い場合
                    addresses_for_task.extend(
                        addresses[index + 4:index + 4 + shortfall])
            all_subsequent_tasks.append(addresses_for_task)

    def select_task(all_subsequent_tasks, CurrentTaskState, is_swap, amount_param):
        if is_swap:
            # Swapが有効な場合、ランダムにアドレスを選択
            return random.sample(all_subsequent_tasks, k=amount_param)
        else:
            # Swapが無効な場合、現在のインデックスに基づいてアドレスを選択
            task = all_subsequent_tasks[CurrentTaskState.index]
            CurrentTaskState.index += 1
            return task

    def update_task_state(CurrentTaskState, all_subsequent_tasks_length):
        # タスクリストの終端に達した場合、タスクステートを更新
        if CurrentTaskState.index >= all_subsequent_tasks_length:
            CurrentTaskState.index = 0
            CurrentTaskState.TaskState = TaskState.ADDITIONAL_TASK


    # DBから初期タスクのアドレスを取得
    collected_answer_as_initial_task = fetch_collected_answer(cursor)

    # ゴールデンスタンダードのアドレスを決定
    golden_standard = calculate_golden_standard(
        collected_answer_as_initial_task)

    # サブシーケントタスクのリストを生成
    all_subsequent_tasks = generate_subsequent_tasks(
        addresses, golden_standard)

    # タスクの選択
    addresses_for_task = select_task(
        all_subsequent_tasks, CurrentTaskState, is_swap, amount_param)

    # タスクステートの更新
    update_task_state(CurrentTaskState, len(all_subsequent_tasks))

    return addresses_for_task

    # all_selected_addresses = [
    #     address for row in rows if row[1] for address in json.loads(row[0])]  # 今までinitial_taskで選ばれたアドレスのリスト
    # address_count = Counter(tuple(address)
    #                         for address in all_selected_addresses)

    # # 各クラウドワーカーが選択したウォレットアドレスの出現回数を集計し、出現回数が最も多いウォレットアドレスをgolden_standardにする
    # golden_standard = address_count.most_common(1)[0][0]

    # all_subsequent_tasks = []

    # # golden_standardに近いアドレスをsubsequent_tasksにする
    # for address in golden_standard:
    #     index = addresses.index(address)
    #     addresses_for_task = addresses[max(0, index - 2):index + 4]
    #     if len(addresses_for_task) < 6:
    #         shortfall = 6 - len(addresses_for_task)
    #         if index - 2 > 0:  # 左側にスペースがある場合
    #             addresses_for_task = addresses[max(
    #                 0, index - 2 - shortfall):index + 4]
    #         else:  # 右側にスペースがある、またはaddresses自体が短い場合
    #             addresses_for_task.extend(
    #                 addresses[index + 4:index + 4 + shortfall])
    #     all_subsequent_tasks.append(addresses_for_task)

    # if is_swap:
    #     addresses_for_task: AddressesForTask = random.sample(
    #         all_selected_addresses, k=amount_param)
    #     print("subsequent_task内でSwapされました")
    #     print("addresses_for_task(swaped)", addresses_for_task)
    #     return addresses_for_task

    # else:
    #     addresses_for_task: AddressesForTask = all_subsequent_tasks[CurrentTaskState.index]
    #     CurrentTaskState.index += 1
    #     print("addresses_for_task", addresses_for_task)
    #     # update_task_state_to_db(cursor, is_initial_task=False,
    #     #                         task_state=CurrentTaskState.TaskState, index=CurrentTaskState.index)
    #     print("len(all_subsequent_tasks)", len(all_subsequent_tasks))  # len=3

    #     # 出題候補であるall_subsequent_tasksの中身を全部使い切った場合、additional_taskに移行
    #     if CurrentTaskState.index >= len(all_subsequent_tasks):
    #         print("これが最後のsubsequent_taskでした。")
    #         CurrentTaskState.index = 0
    #         CurrentTaskState.TaskState = TaskState.ADDITONAL_TASK
    #         update_task_state_to_db(cursor, is_initial_task=False,
    #                                 task_state=CurrentTaskState.TaskState, index=CurrentTaskState.index)

    #     else:
    #         update_task_state_to_db(cursor, is_initial_task=False,
    #                                 task_state=CurrentTaskState.TaskState, index=CurrentTaskState.index)
    #         print("update_task_state_to_dbに対して" + str(CurrentTaskState.TaskState) +
    #               "と" + str(CurrentTaskState.index) + "を渡しました")

    #     return addresses_for_task


def create_additional_task(cursor, addresses: list, CurrentTaskState: CurrentTaskState,  amount_param: int, is_swap: bool):

    # 現状の回答DBの中身を確認
    cursor.execute("SELECT selected_wallets FROM answers")
    all_selected_addresses_in_db = [
        address for row in cursor.fetchall() for address in json.loads(row[0])]
    flat_list = [
        item for sublist in all_selected_addresses_in_db for item in sublist]

    # print("unselected_addressの中身（flat_list）: ", flat_list)  # ここまでは動いてるっぽい

    if set(flat_list) == set(addresses):  # すべてのアドレスが一度は回答に選択されたら、全てのタスク生成プロセスを終了
        print("全てのアドレスを分析し切りました。")
        # このログが出ている場合、DB: answer tableにデータが入りすぎている。なお、ダッシュボードから「Start now」を押すとUnhandled Runtime ErrorTypeError: Cannot read properties of undefined(reading 'length')と表示される。
        # https://scrapbox.io/tkgshn-private/%E5%8E%9F%E5%9B%A0%E8%A7%A3%E6%98%8E%E6%B8%88%E3%81%BF:_%E3%83%80%E3%83%83%E3%82%B7%E3%83%A5%E3%83%9C%E3%83%BC%E3%83%89%E3%81%8B%E3%82%89%22Start_now%22%E3%81%A7%E3%82%BF%E3%82%B9%E3%82%AF%E3%82%92%E9%96%8B%E5%A7%8B%E3%81%99%E3%82%8B%E3%81%A8%E3%80%81_Unhandled_Runtime_Error_TypeError:_Cannot_read_properties_of_undefined_(reading_'length')_%E3%81%8C%E5%87%BA%E3%82%8B#6548687809c5f20000445eb0

        # ここでクラスタリング分析するanalysis/clustering.pyを走らせる
        import subprocess
        subprocess.run(
            ["/opt/homebrew/bin/python3", "../analysis/clustering.py"])
        print("終了処理はPythonでできないので、フロント側に対してAPIを叩いたりして処理する")  # todo

        update_task_state_to_db(
            cursor, is_initial_task=False, task_state=TaskState.NONE, index=0)

        return  # ここで終了させるとどうなる？

    else:
        print("additonal_taskの生成を開始します")  # ここまでは動いている
        is_never_selected_address = set(
            addresses) - set(flat_list)  # 一度も選択されたことのないアドレス群
        is_never_selected_address = list(is_never_selected_address)

        if is_swap:
            print(
                "additonal task中でのswapは、unselected_addressを含めないものをaddress_to_raw_urisとしてデリバリーします")
            addresses_for_task: AddressesForTask = random.sample(flat_list, 6)
            return addresses_for_task

            # address_to_raw_uris = {}
            # for address in AddressesForTask:
            #     address_to_raw_uris[address] = fetch_nfts(address)

            # return jsonify({
            #     "address_to_raw_uris": {
            #         **{
            #             address: {
            #                 "raw_uris": fetch_nfts(address),
            #                 "is_never_selected_address": 0
            #             } for address in AddressesForTask
            #         }
            #     },
            #     "is_initial_task": 0
            # }), 200

        else:
            never_selected_address = is_never_selected_address.pop(
                0)  # unselected_addressesの一番最初を取得
            CurrentTaskState.index += 1
            remaining_addresses = set(addresses) - {never_selected_address}
            addresses_for_task: AddressesForTask = random.sample(
                list(remaining_addresses), amount_param-1)

            # reminidng_address（is_never_selected_addressタグがついてほしい）と、通常のaddresses_for_taskを両方渡してみる
            return never_selected_address, addresses_for_task

            # address_to_raw_uris = {}
            # for address in AddressesForTask:
            #     address_to_raw_uris[address] = fetch_nfts(address)

            # update_task_state_to_db(cursor, is_initial_task=False,
            #                         task_state=TaskState.ADDITONAL_TASK, index=CurrentTaskState.index)

            # return jsonify({
            #     "address_to_raw_uris": {
            #         never_selected_address: {  # 最終ラウンドでは必ず1つはunselected_addressを選択肢に含むこと
            #             "raw_uris": fetch_nfts(never_selected_address),
            #             "is_never_selected_address": 1  # このフラグがtrue（1）な場合は、選択肢として表示される瞬間からすでに選択済みになっている
            #         },
            #         **{
            #             address: {
            #                 "raw_uris": fetch_nfts(address),
            #                 "is_never_selected_address": 0
            #             } for address in AddressesForTask
            #         }
            #     },
            #     "is_initial_task": 0
            # }), 200


# def create_additional_task(cursor, addresses: list, CurrentTaskState: CurrentTaskState, amount_param: int, is_swap: bool):
#     def fetch_all_selected_addresses(cursor):
#         cursor.execute("SELECT selected_wallets FROM answers")
#         return [address for row in cursor.fetchall() for address in json.loads(row[0])]

#     def is_all_addresses_analyzed(selected_addresses, addresses):
#         return set(selected_addresses) == set(addresses)

#     def select_additional_task_addresses(selected_addresses, addresses, is_swap, amount_param):
#         never_selected_addresses = list(
#             set(addresses) - set(selected_addresses))
#         if is_swap:
#             return random.sample(selected_addresses, 6)
#         else:
#             never_selected_address = never_selected_addresses.pop(0)
#             remaining_addresses = set(addresses) - {never_selected_address}
#             return never_selected_address, random.sample(list(remaining_addresses), amount_param - 1)

#     # メインロジック
#     all_selected_addresses_in_db = fetch_all_selected_addresses(cursor)

#     if is_all_addresses_analyzed(all_selected_addresses_in_db, addresses):
#         print("全てのアドレスを分析し切りました。")

#         import subprocess
#         subprocess.run(
#             ["/opt/homebrew/bin/python3", "analysis/clustering.py"])
#         print("終了処理はPythonでできないので、フロント側に対してAPIを叩いたりして処理する")  # todo

#         update_task_state_to_db(
#             cursor, is_initial_task=False, task_state=TaskState.NONE, index=0)
#         return

#     print("additonal_taskの生成を開始します")
#     addresses_for_task = select_additional_task_addresses(
#         all_selected_addresses_in_db, addresses, is_swap, amount_param)

#     return addresses_for_task


@app.route('/api/get-addresses', methods=['GET'])
def get_addresses_and_nfts_handler() -> Response:

    filepath = "./backend_app/static/mvp_addresses30file.json"  # 分析対象のウォレットアドレスがあるファイルパス
    # filename = os.path.basename(filepath).split("~")[0]

    # 分析対象のファイルからアドレスを抜きだす
    try:
        with open(filepath, 'r') as f:
            addresses = json.load(f)
    except FileNotFoundError:
        return jsonify(error="Failed to read addresses file"), 500

    # まずは叩かれたURLのバリデーションをする
    amount_param: int = request.args.get('amount', default=0, type=int)
    if amount_param <= 0:
        return jsonify(error="Invalid amount parameter"), 400
    is_swap: bool = request.args.get(
        'is_swap', default='false').lower() == 'true'

    # URLスキーマで要求された数だけ返せるアドレスがない（分析対象のファイルに全然アドレスがない場合はエラーを返す）
    if len(addresses) < amount_param:
        return jsonify(error="Not enough addresses available"), 400

    conn = sqlite3.connect('dc.db')
    cursor = conn.cursor()
    CurrentTaskState = get_task_state_from_db(cursor)
    print(CurrentTaskState)

    if CurrentTaskState.TaskState == TaskState.INITIAL_TASK:
        addresses_for_task = create_initial_task(cursor, addresses,
                                                 CurrentTaskState, amount_param, is_swap)
        is_initial_task: bool = True

    elif CurrentTaskState.TaskState == TaskState.SUBSEQUENT_TASK:
        addresses_for_task = create_subsequent_task(
            cursor, addresses, CurrentTaskState, amount_param, is_swap)
        is_initial_task: bool = False

    elif CurrentTaskState.TaskState == TaskState.ADDITONAL_TASK:
        print("get_addresses_and_nfts_handler内でのadditional_taskのパートに入りました")  # debug

        result = create_additional_task(
            cursor, addresses, CurrentTaskState, amount_param, is_swap)  # create_additional_taskはreturnが原則「never_selected_address, addresses_for_task」と2つだが、swapした場合はaddresses_for_taskのみになるので、一回resultでキャッチする

        if isinstance(result, tuple):
            never_selected_address = result[0]
            addresses_for_task = result[1]
        else:
            never_selected_address = None
            addresses_for_task = result

        is_initial_task: bool = False

    if never_selected_address is not None:
        print("すでにチェック付きのアドレスが選択肢に含まれます")
        # addresses_for_task = never_selected_address + addresses_for_task
        address_to_raw_uris = {
            never_selected_address: {
                "raw_uris": fetch_nfts(never_selected_address),
                "is_never_selected_address": 1
            },
            **{
                address: {
                    "raw_uris": fetch_nfts(address),
                    "is_never_selected_address": 0
                } for address in addresses_for_task
            }
        }
    else:
        address_to_raw_uris = {
            address: {
                "raw_uris": fetch_nfts(address),
                "is_never_selected_address": 0
            } for address in addresses_for_task
        }

    return jsonify({"address_to_raw_uris": address_to_raw_uris, "is_initial_task": is_initial_task}), 200


# @app.route('/api/get-addresses', methods=['GET'])
# def get_addresses_and_nfts_handler():

#     def fetch_nfts(address):
#         alchemy_url = f"https://eth-mainnet.g.alchemy.com/nft/v3/{os.environ['ALCHEMY_API_KEY']}/getNFTsForOwner?owner={address}&withMetadata=true&pageKey=1&pageSize=10"
#         response = requests.get(alchemy_url)
#         if response.status_code != 200:
#             return jsonify(error="Failed to fetch NFTs"), 500
#         alchemy_response = response.json()
#         raw_uris = [owned_nft['contract']['openSeaMetadata']['imageUrl'] for owned_nft in alchemy_response['ownedNfts']
#                     if 'openSeaMetadata' in owned_nft['contract'] and 'imageUrl' in owned_nft['contract']['openSeaMetadata']]
#         return raw_uris

#     filepath = "./backend_app/static/mvp_addresses30file.json"  # 分析対象のウォレットアドレスがあるファイルパス
#     # filename = os.path.basename(filepath).split("~")[0]

#     # フロント側から叩くURLがamount_param: int, is_swap: boolを持っている
#     amount_param = request.args.get('amount', default=0, type=int)
#     if amount_param <= 0:
#         return jsonify(error="Invalid amount parameter"), 400
#     is_swap = request.args.get('is_swap', default='false').lower() == 'true'

#     try:
#         with open(filepath, 'r') as f:
#             addresses = json.load(f)
#     except FileNotFoundError:
#         return jsonify(error="Failed to read addresses file"), 500

#     if len(addresses) < amount_param:
#         return jsonify(error="Not enough addresses available"), 400

#     # これによってどのタスク生成の各ステータス（initial_task, subsequent_task, additonal_task）にいるかがわかる
#     conn = sqlite3.connect('dc.db')
#     cursor = conn.cursor()
#     cursor.execute(
#         "SELECT Is_initial_task, initial_task_index, subsequent_task_index, additional_task_index FROM TaskState")
#     row = cursor.fetchone()

#     print("`TaskState`DB: ", row)

#     if row:  # TaskStateにすでにデータが存在すれば、それを利用する
#         is_initial_task = row[0]
#         initial_task_index = row[1]
#         subsequent_task_index = row[2]
#         additional_task_index = row[3]
#     else:  # TaskStateにすでにデータが存在しない場合は、このファイルを初めて分析対象にするということなので、まずはinital_taskから始めるようにする
#         is_initial_task = 1
#         initial_task_index = 0
#         print("TaskStateに何も入っていなかったので初期化しました")


#     if is_initial_task == 1:
#         if is_swap:  # Swapでアドレスを要求された場合は、amount_param個のアドレスをランダムに届ける
#             addresses_for_task = random.sample(addresses, k=amount_param)
#             print("Initial_task内でSwapされました")
#         else:
#             print("Initial_taskを開始しました")
#             all_initial_tasks = [addresses[i:i+6]
#                                  for i in range(0, len(addresses), 6)]
#             addresses_for_task = all_initial_tasks[initial_task_index]
#             initial_task_index += 1
#             # print("initial_taskの進捗: " + str(initial_task_index) + "/" + str(len(all_initial_tasks/6))) #debug
#             cursor.execute("UPDATE TaskState SET is_initial_task=?, initial_task_index=?", (
#                 is_initial_task, initial_task_index))


#             # initial_taskの上限に達した場合は、subsequent_taskに移行する
#             if initial_task_index >= len(all_initial_tasks):
#                 is_initial_task = 0
#                 initial_task_index = 0
#                 subsequent_task_index = 0
#                 print("initial_taskの上限に達したので、次からはsubsequent_taskに移行します")

#                 cursor.execute("UPDATE TaskState SET is_initial_task=?, initial_task_index=?, subsequent_task_index=?", (
#                         is_initial_task, initial_task_index, subsequent_task_index))  # DBに反映
#             # # print("インクリメンtろ")
#             # # conn.commit()
#             # if row:
#             #                 # rowが存在する場合、TaskStateテーブルのis_initial_taskとinitial_task_indexを更新します
#             #     cursor.execute("UPDATE TaskState SET is_initial_task=?, initial_task_index=?",(is_initial_task, initial_task_index))
#             #     print("インクリメント")
#             # else:
#             #                 # rowが存在しない場合、TaskStateテーブルに新しいレコードを挿入します
#         cursor.execute("INSERT INTO TaskState (is_initial_task, initial_task_index) VALUES (?, ?)",(is_initial_task, initial_task_index))

#                 # print("conn.commit()")
#         conn.commit()

#     else:
#         # initial_taskの回答からsubsequent_taskを生成するために、DBの中からis_initial_taskがtrueのものだけを取得する
#         cursor.execute(
#             "SELECT selected_wallets, Is_initial_task FROM answers WHERE is_initial_task = 1")
#         rows = cursor.fetchall()
#         all_selected_addresses = [
#             address for row in rows if row[1] for address in json.loads(row[0])]  # 今までinitial_taskで選ばれたアドレスのリスト

#         all_selected_addresses = [
#             tuple(address)for address in all_selected_addresses]  # 重複を除くためにtupleに変換
#         # all_selected_addresses = [
#         #     str(address) for address in all_selected_addresses]  # 重複を除くために文字列に変換

#         address_count = Counter(all_selected_addresses)

#         # 各クラウドワーカーが選択したウォレットアドレスの出現回数を集計し、出現回数が最も多いウォレットアドレスをgolden_standardにする
#         golden_standard = address_count.most_common(1)[0][0]

#         all_subsequent_tasks = []

#         # golden_standardに近いアドレスをsubsequent_tasksにする
#         for address in golden_standard:
#             index = addresses.index(address)
#             addresses_for_task = addresses[max(0, index - 2):index + 4]
#             if len(addresses_for_task) < 6:
#                 shortfall = 6 - len(addresses_for_task)
#                 if index - 2 > 0:  # 左側にスペースがある場合
#                     addresses_for_task = addresses[max(
#                         0, index - 2 - shortfall):index + 4]
#                 else:  # 右側にスペースがある、またはaddresses自体が短い場合
#                     addresses_for_task.extend(
#                         addresses[index + 4:index + 4 + shortfall])
#             all_subsequent_tasks.append(addresses_for_task)

#         if is_swap:
#             addresses_for_task = random.sample(
#                 all_selected_addresses, k=amount_param)
#             print("subsequent_task内でSwapされました")


#         else:
#             print("subsequent_taskを開始しました")
#             # subsequent_task_indexがall_subsequent_tasksの範囲を超えないようにします
#             if subsequent_task_index < len(all_subsequent_tasks):
#                 addresses_for_task = all_subsequent_tasks[subsequent_task_index]
#                 subsequent_task_index += 1
#                 # DB側のsubsequent_task_indexを更新
#                 cursor.execute(
#                     "UPDATE TaskState SET subsequent_task_index=?", (subsequent_task_index,))
#                 conn.commit()
#                 print("initial_taskの上限に達したので、次からはsubsequent_taskに移行します")

#             else:
#                 cursor.execute("SELECT selected_wallets FROM answers")
#                 all_selected_addresses_in_db = [
#                 address for row in cursor.fetchall() for address in json.loads(row[0])]
#                 flat_list = [item for sublist in all_selected_addresses_in_db for item in sublist]

#                 if set(flat_list) == set(addresses):  # すべてのアドレスが一度は回答に選択されたら、全てのタスク生成プロセスを終了
#                     print("全てのアドレスを分析し切りました。")
#                     # このログが出ている場合、DB: answer tableにデータが入りすぎている。なお、ダッシュボードから「Start now」を押すとUnhandled Runtime ErrorTypeError: Cannot read properties of undefined(reading 'length')と表示される。
#                     # https://scrapbox.io/tkgshn-private/%E5%8E%9F%E5%9B%A0%E8%A7%A3%E6%98%8E%E6%B8%88%E3%81%BF:_%E3%83%80%E3%83%83%E3%82%B7%E3%83%A5%E3%83%9C%E3%83%BC%E3%83%89%E3%81%8B%E3%82%89%22Start_now%22%E3%81%A7%E3%82%BF%E3%82%B9%E3%82%AF%E3%82%92%E9%96%8B%E5%A7%8B%E3%81%99%E3%82%8B%E3%81%A8%E3%80%81_Unhandled_Runtime_Error_TypeError:_Cannot_read_properties_of_undefined_(reading_'length')_%E3%81%8C%E5%87%BA%E3%82%8B#6548687809c5f20000445eb0

#                     # ここでクラスタリング分析するanalysis/clustering.pyを走らせる
#                     import subprocess
#                     subprocess.run(["/opt/homebrew/bin/python3",
#                                 "analysis/clustering.py"])
#                     print("終了処理はPythonでできないので、フロント側に対してAPIを叩いたりして処理する")  # todo

#                     return  # ここで終了させるとどうなる？

#             # additonal_task
#                 else:
#                     is_never_selected_address = set(
#                         addresses) - set(flat_list)  # 一度も選択されたことのないアドレス群
#                     is_never_selected_address = list(is_never_selected_address)

#                     if is_swap:
#                         print("Additonal_task内でSwapされました")
#                         addresses_for_task = random.sample(flat_list, amount_param)
#                         address_to_raw_uris = {}
#                         for address in addresses_for_task:
#                             address_to_raw_uris[address] = fetch_nfts(address)
#                             # print("707:", address_to_raw_uris)
#                         # return jsonify({
#                         #     "address_to_raw_uris": {
#                         #         **{
#                         #             address: {
#                         #                 "raw_uris": fetch_nfts(address),
#                         #                 "is_never_selected_address": 0
#                         #             } for address in addresses_for_task
#                         #         }
#                         #     },
#                         #     "is_initial_task": 0
#                         # }), 200

#                     else:
#                         print("additonal taskを開始しました")
#                         if row[3] is not None:
#                             additional_task_index = row[3]
#                         else:
#                             additional_task_index = 0
#                             cursor.execute(
#                                 "UPDATE TaskState SET is_initial_task=0, initial_task_index=0, subsequent_task_index=0, additional_task_index=?", (additional_task_index,))

#                         never_selected_address = is_never_selected_address.pop(
#                             0)  # unselected_addressesの一番最初を取得
#                         remaining_addresses = set(addresses) - {never_selected_address}
#                         addresses_for_task = random.sample(
#                             list(remaining_addresses), 5)

#                         address_to_raw_uris = {}
#                         for address in addresses_for_task:
#                             address_to_raw_uris[address] = fetch_nfts(address)
#                             # print("737: ", address_to_raw_uris[address])

#                         additional_task_index += 1
#                         cursor.execute(
#                             "UPDATE TaskState SET additional_task_index=?", (additional_task_index,))
#                         conn.commit()
#                         return jsonify({
#                             "address_to_raw_uris": {
#                                 never_selected_address: {  # 最終ラウンドでは必ず1つはunselected_addressを選択肢に含むこと
#                                     "raw_uris": fetch_nfts(never_selected_address),
#                                     "is_never_selected_address": 1  # このフラグがtrue（1）な場合は、選択肢として表示される瞬間からすでに選択済みになっている
#                                 },
#                                 **{
#                                     address: {
#                                         "raw_uris": fetch_nfts(address),
#                                         "is_never_selected_address": 0
#                                     } for address in addresses_for_task
#                                 }
#                             },
#                             "is_initial_task": 0
#                         }), 200

#     conn.close()

#     address_to_raw_uris = {}
#     for address in addresses_for_task:
#         address_to_raw_uris[address] = fetch_nfts(address)
#         # print("764: ", address_to_raw_uris[address])
#     return jsonify({"address_to_raw_uris": address_to_raw_uris, "is_initial_task": is_initial_task}), 200


@app.route('/api/insert-data', methods=['POST'])
def insert_data_handler():
    print("このセッションで行うタスクはもうなくなりました。回答結果をDBに保存します。")
    try:
        # フロントエンドから送られてくる回答データを処理する
        data = request.get_json()
        user_address = data.get("userAddress", "")
        all_selected_wallets = data.get("allSelectedWallets", [])
        is_initial_task = data.get("is_initial_task", "")

        if not user_address or not all_selected_wallets:
            return "Invalid fields in the JSON body", 400

        selected_wallets_str = json.dumps(all_selected_wallets)

        conn = sqlite3.connect('dc.db')
        cursor = conn.cursor()

        # DBに保存
        cursor.execute(
            "INSERT INTO answers (user_address, selected_wallets, is_initial_task) VALUES (?, ?, ?)",
            (user_address, selected_wallets_str, is_initial_task)
        )

        conn.commit()
        conn.close()
        return jsonify({"message": "Data received successfully"}), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return "Failed to process the request", 500


@app.route('/api/get-latest-task', methods=['GET'])
def get_latest_task():
    try:
        wallet = request.args.get('wallet')

        # 叩かれたURLパラメータに`${wallet}`があるか確認
        if not wallet:
            return jsonify({"error": "No wallet address provided"}), 400

        conn = sqlite3.connect('dc.db')
        cursor = conn.cursor()

        cursor.execute(
            'SELECT *, datetime(created_at, "localtime") as local_time FROM answers WHERE user_address = ? ORDER BY created_at DESC LIMIT 1', (wallet,))  # UTCから現地時間に変換
        # excuted result:
        # 1 | 0xF60fB76e6AD89364Af3ffE72C447882bFe390331 | [["0x1bc5ebee4738fd95bd96751c45a90889f772e0f3", "0x3812801cbf0e41413db4835a5e36228ad45e32bf", "0xdffe6d135e4396f90ba66a1024bdeb6ef5df9276"], ["0x2342e0debeffc7765ed5e771e18e96068f38d3a4", "0x88f74515cb136609eaa538f71c0e7dadd537d594", "0x9437fe6385f3551850fd892d471ffbc818cf3116"], ["0xfaaa79ed017a66f19bd08161a2ebd215150758c4", "0x5a756d9c7caa740e0342f755fa8ad32e6f83726b", "0x5976a68d20b6ae9a6fae2b12babd0ff5b43fa6b4"]] | 1 | 2023-10-31 03: 48: 39 | 2023-10-31 12: 48: 39

        row = cursor.fetchone()

        # 指定された${wallet}のタスク履歴がなかった場合のエラー処理
        if row is None:
            return jsonify({"error": "No tasks found for this wallet"}), 404

        conn.close()

        return jsonify({"created_at": row[5]}), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return "Failed to process the request", 500


infura_url = "https://mainnet.infura.io/v3/61d8ba9fbb3e4a039dca9d9813a6a566"
Ganache_local_server_url = "HTTP://127.0.0.1:7545"
web3 = Web3(HTTPProvider(Ganache_local_server_url))  # 状況に応じて切り替え

# private_key = os.environ['WALLET_KEY']  # envから送信元の秘密鍵を取得 #なぜかここで転ける
private_key = "0x778d8d7c5aa96fe0adc7214a96cfd91e5fe1eab707bb8e345b2c4fdc19aebf0e"
sender_account = web3.eth.account.from_key(private_key)


def send_transaction(from_address: str, to_address: str, amount: int):
    from_address = Web3.to_checksum_address(from_address)
    to_address = Web3.to_checksum_address(to_address)
    tx = {
        'type': '0x2',
        'nonce': web3.eth.get_transaction_count(from_address),
        'from': from_address,
        'to': to_address,
        'value': web3.to_wei(0.01, 'ether'),
        'maxFeePerGas': web3.to_wei('250', 'gwei'),
        'maxPriorityFeePerGas': web3.to_wei('3', 'gwei'),
        'chainId': 1337
    }
    gas = web3.eth.estimate_gas(tx)
    tx['gas'] = gas
    signed_tx = web3.eth.account.sign_transaction(tx, private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)

    return web3.to_hex(tx_hash)


@app.route('/api/claim_eth', methods=['POST'])
def api_claim_eth():
    data = request.get_json()
    to_address = data.get("userAddress", "")
    amount = data.get("amount", 1000)  # デフォルト値は 1 ETH

    # from_address = "0x23126609Cf2219198383569D1Ea5cC300bb238dc" #todo
    from_address = sender_account.address #todo
    tx_hash = send_transaction(from_address, to_address, amount)
    return jsonify({"message": f"{amount} ETH was sent from {from_address} to {to_address}", "tx_hash": tx_hash}), 200



# 一旦httpで動かす
# if __name__ == '__main__':
#     # app.run(debug=True, ssl_context=('cert.pem', 'key.pem'), port=1337)
#     app.run(host='::', debug=True, ssl_context=(
#         'cert.pem', 'key.pem'), port=1337)

if __name__ == '__main__':
    # app.run(debug=True, ssl_context=('cert.pem', 'key.pem'), port=1337)
    app.run(host='::', debug=True,
        #     ssl_context=(
        # 'cert.pem', 'key.pem'),
        port=1337)
