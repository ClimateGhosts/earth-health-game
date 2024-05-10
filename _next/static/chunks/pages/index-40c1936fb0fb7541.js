(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{8312:function(e,t,s){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return s(2256)}])},2256:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return pages}});var n,o,r,a,l,i,c=s(5893),m=s(7294),d=s(5005),h=s(8837),u=s(1555),x=s(682),p=s(9279),j=s(4490),g=s(2749),N=s(4486),y=s(2914),Z=s(4449),v=s(4051),_=s(2599),f=s(8817),C=s(4741),w=s(1515),E=s(5386),F=s(9578),S=s(9019),b=s(5378),indicator=e=>{let{status:t}=e;return!0===t?(0,c.jsx)(F.Z,{color:"green"}):!1===t?(0,c.jsx)(S.Z,{color:"red"}):(0,c.jsx)(b.Z,{color:"orange"})},k=s(6486),A=s.n(k);let O=(0,m.createContext)({serverUrl:"https://earth-health-game.appmana.com",isConnected:!1}),createSocket=e=>{let t=(0,_.io)(e);return t.url=e,t},SocketIOCommon=e=>{let{children:t,title:s}=e,[n,o]=(0,m.useState)("https://earth-health-game.appmana.com"),[r,a]=(0,m.useState)(()=>createSocket(n)),[l,i]=(0,m.useState)(null),[_,F]=(0,f.Z)("username","Client"),[S,b]=(0,m.useState)([]),[k,I]=(0,C.Z)(new Set([])),[R,T]=(0,m.useState)(!1),[B,D]=(0,m.useState)(""),randomRoomId=()=>Math.round(new Date().getMilliseconds()).toString(),[M,L]=(0,m.useState)(randomRoomId()),[W,G]=(0,w.Z)([]),P=W.find(e=>e.players.some(e=>e.sid===B)),U=!!P;(0,m.useEffect)(()=>(setTimeout(()=>{r.connected||i(!1)},2e3),G.clear(),r.on("connect",()=>{i(!0),console.log("Client Connected"),r.emit("list_roles",{},e=>{let{roles:t}=e;b(t)}),r.emit("list_rooms",{},e=>{let{rooms:t}=e;G.set(t)}),r.emit("info",{},e=>{console.log(e)})}),r.on("disconnect",()=>{i(!1),G.clear(),console.log("Client Disconnected")}),r.on("your_sid",e=>{let{sid:t}=e;D(t)}),r.onAny((e,t)=>{console.log(e,t)}),r.on("game_started",()=>{T(!0)}),r.on("room_changed",e=>{G.update(t=>t.room==e.room,e)}),r.on("room_created",e=>{let{room:t,owner_sid:s}=e;G.push({room:t,owner:s,in_game:!1,players:[]})}),r.on("room_deleted",e=>{let{room:t}=e;G.filter((e,s,n)=>e.room!=t)}),()=>{r.disconnect(),r.close()}),[r]),(0,E.Z)(()=>{n!==r.url&&(r.connected&&r.disconnect(),r.close(),i(null),a(createSocket(n)))},1e3,[n]),(0,E.Z)(()=>{(null==r?void 0:r.connected)&&r.emit("set_roles",{roles:[...k]})},500,[k]),(0,E.Z)(()=>{_&&(null==r?void 0:r.connected)&&r.emit("set_name",{name:_})},500,[_]);let[z,H]=(0,m.useState)(""),[K,J]=(0,m.useState)("");return(0,c.jsxs)(c.Fragment,{children:[R||(0,c.jsxs)(x.Z,{children:[s&&(0,c.jsx)("h1",{className:"text-center m-2",children:s}),(0,c.jsxs)(v.Z,{className:"align-items-center m-2 g-3 justify-content-center",children:[(0,c.jsxs)(u.Z,{md:4,children:[(0,c.jsx)(y.Z.Label,{children:"Server URL"}),(0,c.jsxs)("div",{className:"position-relative",children:[(0,c.jsx)(y.Z.Control,{type:"text",placeholder:"Enter server URL",value:n,onChange:e=>o(e.target.value)}),(0,c.jsx)("div",{className:"end-0 position-absolute absolute-centered-y me-2",children:(0,c.jsx)(indicator,{status:(null==r?void 0:r.url)===n?l:null})})]})]}),(0,c.jsxs)(u.Z,{md:2,children:[(0,c.jsx)(y.Z.Label,{children:"Username"}),(0,c.jsx)(y.Z.Control,{type:"text",placeholder:"Enter username",value:_,onChange:e=>F(e.target.value)})]})]}),(0,c.jsx)("h3",{className:"text-center my-3",children:"Rooms"}),(0,c.jsxs)(v.Z,{className:"g-3 justify-content-center",children:[W.map(e=>{let t=e.players.some(e=>e.sid===B),s=e.owner===B;return(0,c.jsx)(u.Z,{md:4,children:(0,c.jsxs)(h.Z,{className:"text-center p-3 d-flex flex-column h-100 shadow-sm justify-content-between",children:[(0,c.jsx)("h5",{children:e.room}),e.players.map(e=>(0,c.jsxs)("div",{className:"d-flex justify-content-center align-items-center my-2",children:[e.name,e.sid===B?(0,c.jsxs)(p.Z,{autoClose:"outside",className:"ms-2",children:[(0,c.jsx)(N.Z,{size:"sm",className:"text-wrap",children:[...k].sort().map(e=>S[e].name).join(", ")||"No Roles"}),(0,c.jsx)(g.Z,{className:"py-0",children:S.map((e,t)=>(0,c.jsxs)(j.Z,{active:I.has(t),className:"my-2 rounded-2",onClick:()=>I.has(t)?I.remove(t):I.add(t),children:[e.name," (min ",e.min,", max ",e.max,")"]},t))})]}):(0,c.jsxs)(c.Fragment,{children:[" ","(",e.roles.sort().map(e=>S[e].name).join(", ")||"No Roles",")"]})]},e.name)),!t&&(0,c.jsx)(d.Z,{size:"sm",className:"w-50 mt-3 mx-auto",variant:"primary",onClick:()=>{r.emit("join_room",{room:e.room,username:_||null}),r.emit("set_roles",{roles:[...k]})},disabled:e.in_game,children:e.in_game?"In Game":"Join"}),t&&(0,c.jsx)(d.Z,{size:"sm",className:"w-50 mt-3 mx-auto",variant:"danger",onClick:()=>r.emit("leave_room",{}),children:"Leave"}),s&&t&&(0,c.jsx)(d.Z,{size:"sm",className:"w-50 mt-3 mx-auto",variant:"success",onClick:()=>r.emit("start_game",{args:{players:A().chain(e.players).flatMap(e=>e.roles).uniq().value().length}},function(){let{error:e}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};e&&(H(e.type),J(e.message||""))}),children:"Start Game"}),0===e.players.length&&(0,c.jsx)(d.Z,{size:"sm",className:"w-50 mt-3 mx-auto",variant:"danger",onClick:()=>r.emit("delete_room",{room:e.room}),children:"Delete"})]})},e.room)}),!U&&(0,c.jsx)(u.Z,{md:4,className:"text-center",children:(0,c.jsxs)("div",{className:"text-center p-3 d-flex flex-column h-100 justify-content-between",children:[(0,c.jsx)(y.Z.Label,{children:"Room ID"}),(0,c.jsx)(y.Z.Control,{className:"w-25 mx-auto mb-3 text-center",type:"text",placeholder:"Room ID",value:M,onChange:e=>L(e.target.value)}),(0,c.jsx)(d.Z,{className:"w-50 mx-auto",size:"sm",variant:"primary",onClick:()=>{r.emit("create_room",{room:M}),r.emit("join_room",{room:M,username:_||"Client"}),L(randomRoomId())},disabled:!0!==l||U,children:"Create"})]})})]})]}),(0,c.jsx)(O.Provider,{value:{socket:r,serverUrl:n,isConnected:l,roleInfo:S,currentRoom:P},children:t}),(0,c.jsxs)(Z.Z,{show:!!K,onHide:()=>J(""),children:[(0,c.jsx)(Z.Z.Header,{closeButton:!0,children:(0,c.jsx)(Z.Z.Title,{children:z||"Error"})}),(0,c.jsx)(Z.Z.Body,{children:(0,c.jsx)("p",{children:K})})]})]})};var I=s(7172);(n=a||(a={})).OCEAN="Ocean",n.MOUNTAIN="Mountain",n.PLAINS="Plains",n.WOODS="Woods",n.MESA="Mesa",(o=l||(l={})).EARTHQUAKE="Earthquake",o.FIRE="Fire",o.FLOOD="Flood",o.WINDSTORM="Windstorm",(r=i||(i={})).RED="#C0392B",r.GREEN="#27AE60",r.YELLOW="#F1C40F",r.BLUE="#2980B9",r.MAGENTA="#8E44AD",r.CYAN="#16A085",r.WHITE="#ECF0F1",r.ORANGE="#E67E22",r.PURPLE="#9B59B6";let R={[a.MESA]:"#C0392B",[a.MOUNTAIN]:"#16A085",[a.OCEAN]:"#2980B9",[a.PLAINS]:"#F1C40F",[a.WOODS]:"#27AE60"};l.EARTHQUAKE,l.FIRE,l.FLOOD,l.WINDSTORM;let T={91:"#C0392B",92:"#27AE60",93:"#F1C40F",94:"#2980B9",95:"#8E44AD",96:"#16A085",97:"#ECF0F1",33:"#E67E22",105:"#9B59B6"},ansiToHtml=e=>(e=(e=e.replace(/\x1b\[(\d+)m/g,(e,t)=>{let s=T[t];return s?'<span style="color:'.concat(s,'">'):"0"===t?"</span>":e})).replace(/\n/g,"<br><br>"),"<div>".concat(e,"</div>"));var B=s(8540),D=s(8760),M=s(6409),game=()=>{let{socket:e,currentRoom:t,roleInfo:s}=(0,m.useContext)(O),[n,o]=(0,m.useState)(void 0),[r,l]=(0,m.useState)([]),i=(0,m.useMemo)(()=>t&&s?s.map((e,s)=>{var n;return(null===(n=t.players.find(e=>e.roles.includes(s)))||void 0===n?void 0:n.name)||"Unknown"}):[],[t,s]),[x,p]=(0,m.useState)(!1);(0,m.useEffect)(()=>{e&&(e.on("game_started",e=>{e.state&&o(JSON.parse(e.state))}),e.on("operators_available",e=>{l(e.operators)}),e.on("operator_applied",e=>{e.state&&o(JSON.parse(e.state))}),e.on("transition",e=>{let{message:t}=e;N(t)}),e.on("game_ended",e=>{let{message:t}=e;N(t),p(!0)}))},[e]);let j=null==n?void 0:n.current_region,regionFromGeo=e=>{let t=parseInt(e.rsmKey.replace("geo-","")),s=n.world.map[t];return n.world.regions[s]},[g,N]=(0,m.useState)(""),y=(0,M.g)()||1e3;return(0,c.jsxs)("div",{className:"h-auto",children:[n&&(0,c.jsxs)("div",{className:"overflow-hidden position-relative d-flex",children:[(0,c.jsx)(I.ComposableMap,{style:{background:R[a.OCEAN],height:y,width:"100%"},onClick:()=>{},children:(0,c.jsx)(I.ZoomableGroup,{center:[0,0],zoom:2,minZoom:1.5,children:(0,c.jsx)(I.Geographies,{geography:"/earth-health-game/map.geo.json",children:e=>{let{geographies:t}=e,s=A().chain(t).filter((e,t)=>t<n.world.region_count).orderBy(e=>regionFromGeo(e).name===j).value();return s.map(e=>{let t=regionFromGeo(e),s=R[t.region_type._value_];t.health<=0&&(s="#666");let n=j===t.name;return(0,c.jsx)(I.Geography,{geography:e,fill:s,style:{default:{stroke:n?"#FFF":"#666",strokeWidth:1,outline:"none"},hover:{stroke:n?"#FFF":"#666",strokeWidth:1,fill:(0,D.ZP)(s,"#FFF")(.2),outline:"none"}},onClick:e=>{e.stopPropagation()}},t.name)}).concat(s.map(e=>{let t=regionFromGeo(e),s=(0,B.Z)(e);return(0,c.jsxs)(I.Marker,{coordinates:s,className:"pointer-events-none",children:[(0,c.jsx)("text",{textAnchor:"middle",y:-2,style:{fontFamily:"system-ui",fontWeight:"bold",fontSize:5,fill:"#000"},stroke:"#FFF",strokeWidth:.2,children:t.name}),(0,c.jsx)("text",{textAnchor:"middle",y:4,style:{fontFamily:"system-ui",fontWeight:"bold",fontSize:5,fill:"#000"},stroke:"#FFF",strokeWidth:.2,children:t.health>0?(0,c.jsxs)(c.Fragment,{children:[t.health,"❤️"]}):(0,c.jsx)(c.Fragment,{children:"\uD83D\uDC80"})})]},e.rsmKey)}))}})})}),(0,c.jsxs)("div",{className:"position-absolute w-100 h-100 pointer-events-none",children:[(0,c.jsxs)(h.Z,{className:"position-absolute shadow-lg w-25 ms-4 mt-4 p-3",children:[(0,c.jsx)("h3",{className:"text-center",children:"Player Info"}),(0,c.jsx)(v.Z,{className:"row-cols-1 g-2",children:n.players.map((e,t)=>(0,c.jsx)(u.Z,{children:(0,c.jsxs)(v.Z,{className:"row-cols-1 g-2",children:[(0,c.jsxs)(u.Z,{children:["Player ",t," (",i[t],"): $",e.money,"M"]}),Object.values(n.world.regions).filter(t=>t.current_player===e.player_id).map((e,t)=>(0,c.jsxs)(u.Z,{className:"ms-4",children:[e.name," (",e.region_type._value_,","," ",e.health,"❤️)"]},t))]})},t))}),(0,c.jsx)("h3",{className:"text-center mt-3",children:"State Info"}),(0,c.jsxs)(v.Z,{className:"row-cols-1 g-2",children:[(0,c.jsxs)(u.Z,{children:["Time: ",n.time]}),(0,c.jsxs)(u.Z,{children:["Climate Badness ",n.global_badness]})]})]}),(0,c.jsx)(h.Z,{className:"position-absolute shadow-lg w-25 mt-4 me-4 p-3 end-0",children:(0,c.jsxs)("h3",{className:"text-center",children:["Player ",n.current_player," (",i[n.current_player],") choosing for"," ",(0,c.jsx)("u",{children:n.current_region})]})}),(0,c.jsxs)(h.Z,{className:"position-absolute absolute-centered-x bottom-0 mb-4 shadow-lg w-auto p-3 ",children:[(0,c.jsx)("h3",{className:"text-center",children:r.length>0?"Operators":"Waiting for Others"}),(0,c.jsx)(v.Z,{className:"row-cols-1 g-2 mb-2  pointer-events-auto",children:r.map(t=>{let{op_no:s,name:n}=t;return(0,c.jsx)(u.Z,{className:"d-flex justify-content-center",children:(0,c.jsxs)(d.Z,{onClick:()=>e.emit("operator_chosen",{op_no:s,params:null}),children:["(",s,") ",n]})},s)})})]})]})]}),(0,c.jsxs)(Z.Z,{size:"lg",show:!!g,onHide:()=>{N(""),x&&window.location.reload()},backdrop:"static",className:"user-select-none",children:[(0,c.jsx)(Z.Z.Header,{closeButton:!0,children:(0,c.jsx)(Z.Z.Title,{children:x?"Game Over!":"Transition"})}),(0,c.jsx)(Z.Z.Body,{children:(0,c.jsx)("p",{dangerouslySetInnerHTML:{__html:ansiToHtml(g)}})})]})]})},pages=()=>(0,c.jsx)(c.Fragment,{children:(0,c.jsx)(SocketIOCommon,{title:"Collaborative Climate Contest",children:(0,c.jsx)(game,{})})})}},function(e){e.O(0,[662,817,774,888,179],function(){return e(e.s=8312)}),_N_E=e.O()}]);