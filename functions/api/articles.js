import {json} from "./_auth.js";
const seed=[
{id:"group-about",title:"暇つぶしグループ",category:"グループ",body:"このページにグループの紹介を書いてください。"},
{id:"group-history",title:"グループの歴史",category:"グループ",body:"グループができたきっかけや出来事を記録してください。"},
{id:"member-friend-1",title:"友達1",category:"メンバー",body:"プロフィールやエピソードを書いてください。本人が公開してよい内容だけを載せましょう。"},
{id:"member-friend-2",title:"友達2",category:"メンバー",body:"プロフィールやエピソードを書いてください。本人が公開してよい内容だけを載せましょう。"},
{id:"episode-quotes",title:"名言・迷言集",category:"エピソード",body:"みんなの印象に残った言葉を記録してください。"},
{id:"glossary",title:"用語集",category:"用語",body:"グループ内で使う言葉や意味を記録してください。"}
];
export async function onRequestGet({env}){if(!env.WIKI_KV)return json({error:"KVの設定が必要です。"},503);let raw=await env.WIKI_KV.get("articles");if(!raw){await env.WIKI_KV.put("articles",JSON.stringify(seed));raw=JSON.stringify(seed);}try{return json({articles:JSON.parse(raw)});}catch{return json({error:"記事データを読み込めません。"},500);}}
export async function onRequestPost({request,env}){if(!env.WIKI_KV)return json({error:"KVの設定が必要です。"},503);try{const b=await request.json();const title=String(b.title||"").trim(),category=String(b.category||"その他"),body=String(b.body||"");if(!title||!body||title.length>80||body.length>12000)return json({error:"タイトルと本文を入力してください。"},400);const list=JSON.parse(await env.WIKI_KV.get("articles")||"[]");const id="a-"+crypto.randomUUID();list.push({id,title,category,body});await env.WIKI_KV.put("articles",JSON.stringify(list));return json({ok:true,id},201);}catch{return json({error:"記事を保存できませんでした。"},500);}}