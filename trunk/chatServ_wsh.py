#!/usr/bin/env python
# coding:utf-8
import json
from mod_pywebsocket import common
from mod_pywebsocket import stream

clients_list = []
users_list = {}

class MSGTYPE():
        JOIN = "JOIN"
        HEARTBEAT = "HEARTBEAT"
        POST = "POST"
        QUIT = "QUIT"

def web_socket_do_extra_handshake(request):
        pass

def web_socket_transfer_data(request):
        global clients_list,users_list
        while True:
                msg = request.ws_stream.receive_message()
                if msg is None:
                        continue
                if isinstance(msg, unicode):
                        reply = {}
                        msgObj = json.loads(msg)
                        if msgObj['type'] == MSGTYPE.JOIN:
                                reply['type'] = MSGTYPE.JOIN
                                reply['succ'] = 0 if msgObj['user_nickname'] in users_list.keys() else 1
                                if reply['succ']:
                                        reply['text_type'] = "muted"
                                        reply['msg'] = "[+] "+msgObj['user_nickname']+u"进入聊天室,Welcome!"
                                        if msgObj['user_nickname'] not in users_list.keys():
                                                users_list[msgObj['user_nickname']] = msgObj['user_sex']
                                        reply['user_list'] = users_list
                                        if request not in clients_list:
                                                clients_list.append(request)
                                        sentToAllClient(json.dumps(reply).encode('utf-8'))
                                else:
                                        reply['text_type'] = "text-warning"
                                        reply['msg'] = u"[-] 昵称重复,请刷新页面重新登陆."
                                        reply['user_list'] = users_list
                                        request.ws_stream.send_message(json.dumps(reply).encode('utf-8'))
                                        request.ws_stream.close_connection()

                        elif msgObj['type'] == MSGTYPE.POST:
                                reply['type'] = MSGTYPE.POST
                                reply['text_type'] = "text-info"
                                reply['msg'] = "[*] "+msgObj['from']+u"对"+(msgObj['to'] if msgObj['to'] else u"所有人")+u"说:"+msgObj['context']
                                sentToAllClient(json.dumps(reply).encode('utf-8'))
                        elif msgObj['type'] == MSGTYPE.QUIT:
                                reply['type'] = MSGTYPE.QUIT
                                reply['text_type'] = "muted"
                                reply['msg'] = "[-] "+msgObj['user_nickname']+u"退出聊天室,See U!"
                                if msgObj['user_nickname'] in users_list.keys():
                                        del(users_list[msgObj['user_nickname']])
                                reply['user_list'] = users_list
                                sentToAllClient(json.dumps(reply).encode('utf-8'))
                                if request in clients_list:
                                        clients_list.remove(request)
                                        request.ws_stream.close_connection()
                        elif msgObj['type'] == MSGTYPE.HEARTBEAT:
                                pass

def sentToAllClient(msg,binary=False):
        for client in clients_list:
                client.ws_stream.send_message(msg)
