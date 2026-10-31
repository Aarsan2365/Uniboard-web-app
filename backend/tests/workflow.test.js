process.env.UPLOAD_STORAGE = 'local';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const { User, Notice } = require('../models');
test('MongoDB full notice workflow and audience isolation', { timeout: 180000 }, async () => {
 process.env.JWT_SECRET = 'test-only-secret-never-for-real-accounts';
 const db = await MongoMemoryServer.create({ instance: { args: ['--nounixsocket'] } }); let server;
 try {
  await mongoose.connect(db.getUri('uniboard_test'));
  await User.create({name:'Admin',email:'admin@example.edu',password:await bcrypt.hash('TestPassword123!',10),role:'admin'});
  server=app.listen(0); await new Promise(r=>server.once('listening',r));
  const base=`http://127.0.0.1:${server.address().port}/api`;
  async function req(path,method='GET',body,token,status=200) {
   const multipart=body instanceof FormData;
   const res=await fetch(base+path,{method,headers:{...(token?{Authorization:`Bearer ${token}`} : {}),...(!multipart&&body?{'Content-Type':'application/json'}:{})},body:body?(multipart?body:JSON.stringify(body)):undefined});
   const data=await res.json(); assert.equal(res.status,status,`${method} ${path}: ${JSON.stringify(data)}`); return data;
  }
  const admin=(await req('/auth/admin/login','POST',{email:'admin@example.edu',password:'TestPassword123!'})).token;
  async function student(email,batch) {
    const created = await req('/auth/register','POST',{name:'Student',email,password:'TestPassword123!',batch},null,201);
    assert.equal(created.token, undefined, 'registration must require a subsequent login');
    return (await req('/auth/login','POST',{email,password:'TestPassword123!'})).token;
  }
  const a=await student('a@example.edu','2026'), b=await student('b@example.edu','2025');
  assert.equal((await req('/auth/me','GET',null,a)).user.batch,'2026');
  assert.equal((await req('/auth/me','PUT',{name:'Updated Student',batch:'2026',role:'admin'},a)).user.role,'student');
  function form(extra={}) { const f=new FormData();for(const [k,v] of Object.entries({title:'Published notice',body:'Content',category:'General',targetBatch:'All',...extra}))f.append(k,v);return f;}
  const notice=await req('/notices','POST',form(),admin,201);
  assert.equal(notice.author.name,'Admin');
  const target=await req('/notices','POST',form({targetBatch:'2026'}),admin,201);
  const imageForm=form({title:'Image'});
  imageForm.append('image',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'pixel.png');
  const img=await req('/notices','POST',imageForm,admin,201);
  assert.equal((await fetch(base.replace('/api','')+img.imageUrl)).status,200);
  require('fs').unlinkSync(require('path').join(__dirname,'..',img.imageUrl));
  const event=await req('/notices','POST',form({category:'Events',eventDate:'2099-12-15T10:00:00Z',eventLocation:'Hall'}),admin,201);
  await req('/notices','POST',form(),a,403);
  assert.match((await req('/notices','POST',form({title:''}),admin,400)).message,/Title/);
  await req('/notices','POST',form({category:'Events'}),admin,400);
  assert.equal((await req('/notices','GET',null,a)).meta.total,4);
  assert.equal((await req('/notices?search=Published','GET',null,b)).data.some(n => n.id === target.id),false);
  for(const [path,method,body] of [[`/notices/${target.id}`,'GET'],[`/notices/${target.id}/save`,'POST'],[`/notices/${target.id}/read`,'POST'],[`/notices/${target.id}/comments`,'POST',{body:'Denied'}]]) await req(path,method,body,b,404);
  assert.equal((await req('/notices/events/upcoming','GET',null,a)).data[0].id,event.id);
  for(let i=0;i<2;i++) {await req(`/notices/${notice.id}/save`,'POST',null,a);await req(`/notices/${notice.id}/read`,'POST',null,a);}
  assert.equal((await req('/notices/saved','GET',null,a)).data.length,1);
  assert.equal((await req('/notices/unread-count','GET',null,a)).unreadCount,3);
  assert.equal((await req(`/notices/${notice.id}/reads`,'GET',null,admin)).count,1);
  const comment=await req(`/notices/${notice.id}/comments`,'POST',{body:'Thanks'},a,201);
  await req(`/comments/${comment.id}`,'DELETE',null,b,403);
  await req(`/comments/${comment.id}`,'DELETE',null,a);
  await req(`/notices/${notice.id}`,'PUT',form({title:'Edited'}),admin);
  assert.equal((await req(`/notices/${notice.id}`,'GET',null,a)).title,'Edited');
  await req(`/notices/${notice.id}`,'DELETE',null,a,403);
  await req(`/notices/${notice.id}`,'DELETE',null,admin);
  assert.equal((await req('/notices/saved','GET',null,a)).data.length,0);
  await Notice.collection.insertOne({title:'Legacy',body:'Broadcast',category:'General',createdAt:new Date()});
  assert.equal((await req('/notices?search=Legacy','GET',null,a)).data.length,1);
 } finally {if(server)await new Promise(r=>server.close(r));await mongoose.disconnect();await db.stop();}
});
