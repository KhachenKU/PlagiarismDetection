import firebase_admin
from firebase_admin import credentials, firestore
import threading
import time
# detect
import pandas as pd
import re
from tqdm import tqdm # library to show progress bar
import pickle # library to load/dump binary file
from pythainlp.tokenize import word_tokenize
from pythainlp.tag.named_entity import ThaiNameTagger
ner = ThaiNameTagger()

cred = credentials.Certificate("./plagiarism-th-eng-firebase-adminsdk-bzmii-61e69458dd.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Create an Event for notifying main thread.
callback_done = threading.Event()

# Queue for main program
queue = []

# Create a callback on_snapshot function to capture changes
def on_snapshot(doc_snapshot, changes, read_time):
    for change in changes:
        if change.type.name == 'ADDED':
            print(f'New document: {change.document.id}')
            queue.append(change.document.id)
    callback_done.set()

doc_ref = db.collection(u'documents').where(u'status', u'==', u'อยู่ระหว่างการตรวจสอบ')

# Watch the document
doc_watch = doc_ref.on_snapshot(on_snapshot)

###### detect ######
def readFile(filePath):
    f = open(filePath, "rb") #สั่งเปิดไฟล์
    file = pickle.load(f) # load ไฟล์
    f.close() #สั่งปิดไฟล์
    
    return file

thai_dic = readFile("../../Edit distance/dictionary/thai_test_set_dictionary.pkl") # อ่านไฟล์ thai dictionary
eng_dic = readFile("../../Edit distance/dictionary/eng_dictionary_new.pkl") # อ่านไฟล์ english dictionary

def readSentences(filePath, NER=False):

    file = readFile(filePath)
    
    if NER: # case ที่ มี NER tag ในข้อมูลด้วย
        sents = []
        ners = []
        for i in file:
            sent = []
            ner = []
            for j in i:
                sent.append(j[0])
                ner.append(j[1])
            sents.append(sent)
            ners.append(ner)
        return sents, ners
    else: # case ที่ ไม่มี NER tag ในข้อมูลด้วย
        return file

def editDistDP_NER(eng_sentence, thai_sentence, eng_ner, thai_ner, findPath=False): 
    
    # initial variable
    m = len(eng_sentence)
    n = len(thai_sentence)
    dp = [[0 for x in range(n + 1)] for x in range(m + 1)] # Create a table to store results of subproblems
    if findPath: # ถ้าอยากดู path
        path = [['' for x in range(n + 1)] for x in range(m + 1)]
    
    # check empty sentence
    if (not eng_sentence) or (not thai_sentence):
        return 9999
    
    # local function
    def PathFindding(m, n):
        minimumPath = []
        a, b = m, n
        while a > 0 and b > 0:
            minimumPath.insert(0, {'eng':eng_sentence[a-1], 'thai':thai_sentence[b-1], 'choice': path[a][b]})
            choice = min(dp[a][b-1],        # Insert
                        dp[a-1][b],         # Remove
                        dp[a-1][b-1])       # Replace
            if choice == dp[a][b-1]:
                b = b-1
            elif choice == dp[a-1][b]:
                a = a-1
            elif choice == dp[a-1][b-1]:
                a = a-1
                b = b-1
            else:
                a = a-1
                b = b-1 
        return minimumPath
    
    def scoring(i, j):
        # initial variable
        score = 0 # score ของความเหมือน (โดยยิ่งน้อยยิ่งเหมือน range = [0,1])
        same_meaning = 0 # ตัวแปรเก็บจำนวนความเหมือนของความหมาย
        num_thai_meaning = 0 # จำนวนความหมาย
        num_english_meaning = 0 # จำนวนความหมาย

        # if a word have meaning in dictionary
        try:
            # เก็บจำนวนความหมาย
            num_english_meaning = len(eng_dic[eng_sentence[i-1].lower()])
            num_thai_meaning = len(thai_dic[thai_sentence[j-1]])

            # ถ้ามีความหมายตรงกันหมดให้คะแนนเต็มไปเลย
            if thai_dic[thai_sentence[j-1]] == eng_dic[eng_sentence[i-1]]:
                score = 0
            # ถ้าไม่เหมือนหมดจะหาจำนวนความหมายที่เหมือนแล้วนำไปคิดคะแนนต่อไป
            else:
                for thai_meaning in thai_dic[thai_sentence[j-1]]:
                    for eng_meaning in eng_dic[eng_sentence[i-1]]:
                        if thai_meaning == eng_meaning:
                            same_meaning += 1
                            break

                # ช่วงคิดคะแนน
                # ไม่มีความหมายที่ตรงกันเลย
                if same_meaning == 0:
                    score = 1
                # มีอย่างน้อย 1 ความหมายที่ตรงกัน
                else:
#                     if num_thai_meaning == same_meaning:
                    score = 0
#                     else:
#                         alpha = 0.90
#                     score = 1 - (same_meaning / (same_meaning + (alpha * (len(thai_dic[thai_sentence[j-1]]) - same_meaning)) + ((1 - alpha) * (len(eng_dic[eng_sentence[i-1]]) - same_meaning))))

        # if a word doesn't have meaning in dictionary       
        # Note: ตรงนี้อาจจะต้องปรับแก้
        except:
            if (eng_ner[i-1] == thai_ner[j-1]) and eng_ner[i-1] != 'O' and thai_ner[j-1] != 'O':
                return 0, True
            else:
                return 1, False
                
        return score, same_meaning != 0 # case แค่เหมือนตัวเดียวเอาเลย
#         return score, (num_thai_meaning - same_meaning == 0 and num_english_meaning - same_meaning == 0) # case ดูอัตราส่วน
#         return score, num_thai_meaning == same_meaning # case ดูความหมายไทยเป็นหลัก
                
    # Edit distance
    for i in range(m + 1):
        for j in range(n + 1):
 
            # my score
            score, copy_check = scoring(i, j)

            # If first sentence is empty, only option is to
            # insert all words of second sentence
            if i == 0:
                dp[i][j] = j   # Min. operations = j
 
            # If second sentence is empty, only option is to
            # remove all words of second sentence
            elif j == 0:
                dp[i][j] = i   # Min. operations = i
 
            # If last word have same meaning, ignore last char
            # and recur for remaining sentence
            elif copy_check:
                dp[i][j] = dp[i-1][j-1]
                if findPath:
                    path[i][j] = 'Copy'
 
            # If last word are different meaning, consider all
            # possibilities and find minimum
            else:
                choice = min(dp[i][j-1],        # Insert
                             dp[i-1][j],        # Remove
                             dp[i-1][j-1])      # Replace
                dp[i][j] = score + choice
                    
                if findPath:
                    if choice == dp[i][j-1]:
                        path[i][j] = 'Insert'
                    elif choice == dp[i-1][j]:
                        path[i][j] = 'Remove'
                    else:
                        path[i][j] = 'Replace'
    if findPath:
        return dp[m][n], PathFindding(m, n)
    else:
        return dp[m][n]

read_ner = True

eng_file_path = "../../Edit distance/data/eng_sent_stanfordNER.data"
if read_ner:
    eng_sents, eng_ners = readSentences(eng_file_path, read_ner)
else:
    eng_sents = readSentences(eng_file_path, read_ner)

eng_raw = "../../Edit distance/data/combine.csv"
eng_sents_raw = list(pd.read_csv(eng_raw).en_text)

# Keep the app running
while True:
    while queue:
        doc_ref = db.collection(u'documents').document(str(queue[0]))
        doc = doc_ref.get()

        tmp = ner.get_ner(doc.to_dict()['content'])
        
        clean = []
        NE_text = ''
        NE = ''
        trigger = 0
        for j in tqdm(tmp):
            text = re.sub(r'[^\w\s\u0E00-\u0E7F]','',j[0])
            if (text == '' or text == ' ') and j[2][0] == 'O':
                continue
            
            if j[2][0] == 'B' and trigger == 0:
                NE_text = text
                NE = j[2][2:]
                trigger = 1
            elif j[2][0] == 'I' and trigger == 1:
                NE_text += text
            elif j[2][0] == 'B' and trigger == 1:
                clean.append((NE_text, NE))
                NE_text = text
                NE = j[2][2:]
            else:
                if NE_text and NE:
                    clean.append((NE_text, NE))
                    NE_text = ''
                    NE = ''
                    trigger = 0
                clean.append((text, j[2]))    
        if NE_text and NE:
            clean.append((NE_text, NE))
        
        thai_sent = [x[0] for x in clean]
        thai_ner = [x[1] for x in clean]

        similarity = {}

        for index in tqdm(range(len(eng_sents))):
            if abs(len(eng_sents[index]) - len(thai_sent)) < round(len(thai_sent)*(2/3)):
                similarity[index] = editDistDP_NER(eng_sents[index],
                                                    thai_sent,
                                                    eng_ners[index],
                                                    thai_ner
                                                    )
            else:
                similarity[index] = len(eng_sents[index]) + len(thai_sent)

        sorted_tuples = sorted(similarity.items(), key=lambda item: item[1])
        sorted_similarity = {}
        prev = 0
        rank = 0
        for i, v in enumerate(sorted_tuples):
            if v[1] != prev:
                sorted_similarity[v[0]] = (i, v[1])
                rank = i
            else:
                sorted_similarity[v[0]] = (rank, v[1])
            prev = v[1]

        least_score = list(sorted_similarity)[0]
        most_five_SimSent = [eng_sents_raw[list(sorted_similarity)[i]] for i in range(5)]

        # add all_same_sents, percent and change status, content
        doc_ref.set({
            u'all_same_sents': [ {'name': 'First similar sentence',
                                 'sent': most_five_SimSent[0] + ' (Rank: ' + str(sorted_similarity[list(sorted_similarity)[0]][0] + 1) + ')'},
                                 {'name': 'Second similar sentence',
                                 'sent': most_five_SimSent[1] + ' (Rank: ' + str(sorted_similarity[list(sorted_similarity)[1]][0] + 1) + ')'},
                                 {'name': 'Third similar sentence',
                                 'sent': most_five_SimSent[2] + ' (Rank: ' + str(sorted_similarity[list(sorted_similarity)[2]][0] + 1) + ')'},
                                 {'name': 'Fourth similar sentence',
                                 'sent': most_five_SimSent[3] + ' (Rank: ' + str(sorted_similarity[list(sorted_similarity)[3]][0] + 1) + ')'},
                                 {'name': 'Fifth similar sentence',
                                 'sent': most_five_SimSent[4] + ' (Rank: ' + str(sorted_similarity[list(sorted_similarity)[4]][0] + 1) + ')'}],
            u'percent': 100,
            u'status': 'ตรวจสอบสำเร็จ',
            u'content': '<p>' + '<mark>' + doc.to_dict()['content'] + '</mark>' + '</p>'
        }, merge=True)

        queue.pop(0)
        print('Update Complete...')
    
    time.sleep(5)
    print('processing...')