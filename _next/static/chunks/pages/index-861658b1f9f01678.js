(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{8312:function(e,t,s){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return s(5230)}])},5230:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return pages}});var n,r,a,o,l,i,c,m,d,u,h=s(5893),p=s(7294),x=s(5005),g=s(8837),_=s(1555),j=s(682),y=s(4747),N=s(4490),v=s(2960),Z=s(2749),C=s(4486),E=s(2914),f=s(4449),w=s(4051),b=s(2599),F=s(8817),O=s(1978),k=s(1143),R=s(1515),A=s(5386),D=s(9578),S=s(9019),T=s(5378),indicator=e=>{let{status:t}=e;return!0===t?(0,h.jsx)(D.Z,{color:"green"}):!1===t?(0,h.jsx)(S.Z,{color:"red"}):(0,h.jsx)(T.Z,{color:"orange"})},I=s(6486),M=s.n(I);let G=(0,p.createContext)({socket:void 0,serverUrl:"https://earth-health-game.appmana.com",isConnected:!1,myRoles:[]}),createSocket=e=>{let t=(0,b.io)(e);return t.url=e,t},getOptionValue=(e,t)=>{switch(e.type){case"str":return String(t);case"bool":return!!t;case"int":return"string"==typeof t?parseInt(t):Number(t);case"float":return"string"==typeof t?parseFloat(t):Number(t)}},SocketIOCommon=e=>{let{children:t,title:s}=e,[n,r]=(0,F.Z)("serverUrl","https://earth-health-game.appmana.com"),[a,o]=(0,p.useState)(()=>createSocket(n)),[l,i]=(0,p.useState)(null),[c,m]=(0,F.Z)("username","Client"),[d,u]=(0,p.useState)([]),[b,D]=(0,O.Z)(new Set([])),[S,T]=(0,p.useState)(!1),[I,B]=(0,p.useState)(""),[H,P]=(0,p.useState)([]),[L,U]=(0,k.Z)({}),randomRoomId=()=>Math.round(new Date().getMilliseconds()).toString(),[W,z]=(0,p.useState)(randomRoomId()),[K,J]=(0,R.Z)([]),q=K.find(e=>e.players.some(e=>e.sid===I)),Q=!!q;(0,p.useEffect)(()=>(setTimeout(()=>{a.connected||i(!1)},2e3),J.clear(),a.on("connect",()=>{i(!0),console.log("Client Connected"),a.emit("list_roles",{},e=>{let{roles:t}=e;u(t)}),a.emit("list_rooms",{},e=>{let{rooms:t}=e;J.set(t)}),a.emit("info",{},e=>{console.log(e)}),a.emit("list_options",{},e=>{let{options:t}=e;P(t),U.setAll(Object.fromEntries(t.map(e=>[e.name,e.default])))})}),a.on("disconnect",()=>{i(!1),J.clear(),console.log("Client Disconnected")}),a.on("your_sid",e=>{let{sid:t}=e;B(t)}),a.onAny((e,t)=>{console.log(e,t)}),a.on("game_started",()=>{T(!0)}),a.on("room_changed",e=>{J.update(t=>t.room==e.room,e)}),a.on("room_created",e=>{let{room:t,owner_sid:s}=e;J.push({room:t,owner:s,in_game:!1,players:[]})}),a.on("room_deleted",e=>{let{room:t}=e;J.filter((e,s,n)=>e.room!=t)}),()=>{a.disconnect(),a.close()}),[a]),(0,A.Z)(()=>{n!==a.url&&(a.connected&&a.disconnect(),a.close(),i(null),o(createSocket(n)))},1e3,[n]),(0,A.Z)(()=>{(null==a?void 0:a.connected)&&a.emit("set_roles",{roles:[...b]})},500,[b]),(0,A.Z)(()=>{c&&(null==a?void 0:a.connected)&&a.emit("set_name",{name:c})},500,[c]);let[V,X]=(0,p.useState)(""),[Y,$]=(0,p.useState)("");return(0,h.jsxs)(h.Fragment,{children:[S||(0,h.jsxs)(j.Z,{children:[s&&(0,h.jsx)("h1",{className:"text-center m-2",children:s}),(0,h.jsxs)(w.Z,{className:"align-items-center m-2 g-3 justify-content-center",children:[(0,h.jsxs)(_.Z,{md:4,children:[(0,h.jsx)(E.Z.Label,{children:"Server URL"}),(0,h.jsxs)("div",{className:"position-relative",children:[(0,h.jsx)(E.Z.Control,{type:"text",placeholder:"Enter server URL",value:n,onChange:e=>r(e.target.value)}),(0,h.jsx)("div",{className:"end-0 position-absolute absolute-centered-y me-2",children:(0,h.jsx)(indicator,{status:(null==a?void 0:a.url)===n?l:null})})]})]}),(0,h.jsxs)(_.Z,{md:2,children:[(0,h.jsx)(E.Z.Label,{children:"Username"}),(0,h.jsx)(E.Z.Control,{type:"text",placeholder:"Enter username",value:c,onChange:e=>m(e.target.value)})]})]}),(0,h.jsx)("h3",{className:"text-center my-3",children:"Rooms"}),(0,h.jsxs)(w.Z,{className:"g-3 justify-content-center",children:[K.map(e=>{let t=e.players.some(e=>e.sid===I),s=e.owner===I;return(0,h.jsx)(_.Z,{md:4,children:(0,h.jsxs)(g.Z,{className:"text-center p-3 d-flex flex-column h-100 shadow-sm justify-content-between",children:[(0,h.jsxs)("h5",{children:["#",e.room]}),e.players.map(e=>(0,h.jsxs)("div",{className:"d-flex justify-content-center align-items-center my-2",children:[e.name,e.sid===I?(0,h.jsxs)(y.Z,{autoClose:"outside",className:"ms-2",children:[(0,h.jsx)(C.Z,{size:"sm",className:"text-wrap",children:[...b].sort().map(e=>d[e].name).join(", ")||"No Roles"}),(0,h.jsx)(Z.Z,{className:"py-0",children:d.map((e,t)=>(0,h.jsxs)(N.Z,{active:D.has(t),className:"my-2 rounded-2",onClick:()=>D.has(t)?D.remove(t):D.add(t),children:[e.name," (min ",e.min,", max ",e.max,")"]},t))})]}):(0,h.jsxs)(h.Fragment,{children:[" ","(",e.roles.sort().map(e=>d[e].name).join(", ")||"No Roles",")"]})]},e.name)),!t&&(0,h.jsx)(x.Z,{size:"sm",className:"w-50 mt-3 mx-auto",variant:"primary",onClick:()=>{a.emit("join_room",{room:e.room,username:c||null}),a.emit("set_roles",{roles:[...b]})},disabled:e.in_game,children:e.in_game?"In Game":"Join"}),t&&(0,h.jsx)(x.Z,{size:"sm",className:"w-50 mt-3 mx-auto",variant:"danger",onClick:()=>a.emit("leave_room",{}),children:"Leave"}),s&&t&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(x.Z,{size:"sm",className:"w-50 mt-3 mx-auto",variant:"success",onClick:()=>{console.log(L),a.emit("set_roles",{roles:[...b]}),a.emit("start_game",{args:{...L,players:M().chain(e.players).flatMap(e=>e.roles).uniq().value().length}},function(){let{error:e}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};e&&(X(e.type),$(e.message||""))})},children:"Start Game"}),(null==H?void 0:H.length)&&(0,h.jsxs)(y.Z,{className:"mt-3",autoClose:"outside",children:[(0,h.jsx)(C.Z,{size:"sm",variant:"outline-primary",className:"border-0 text-body",children:"Options"}),(0,h.jsx)(Z.Z,{children:H.filter(e=>!!e.description).map((e,t)=>(0,h.jsx)(v.Z,{children:(0,h.jsxs)(w.Z,{className:"row-cols-2",children:[(0,h.jsx)(_.Z,{xs:"auto",className:"me-auto",children:e.name}),(0,h.jsx)(_.Z,{xs:"auto",children:"bool"===e.type?(0,h.jsx)(x.Z,{size:"sm",variant:!0==U.get(e.name)?"success":"danger",onClick:()=>U.set(e.name,!U.get(e.name)),children:!0==U.get(e.name)?"True":"False"}):(0,h.jsx)(E.Z.Control,{value:String(U.get(e.name)),type:"str"===e.type?"text":"number",onChange:t=>U.set(e.name,getOptionValue(e,t.target.value))})}),(0,h.jsx)(_.Z,{xs:"auto",className:"text-black-50",children:e.description})]})},t))})]})]}),0===e.players.length&&(0,h.jsx)(x.Z,{size:"sm",className:"w-50 mt-3 mx-auto",variant:"danger",onClick:()=>a.emit("delete_room",{room:e.room}),children:"Delete"})]})},e.room)}),!Q&&(0,h.jsx)(_.Z,{md:4,className:"text-center",children:(0,h.jsxs)("div",{className:"text-center p-3 d-flex flex-column h-100 justify-content-between",children:[(0,h.jsx)(E.Z.Label,{children:"Room ID"}),(0,h.jsx)(E.Z.Control,{className:"w-25 mx-auto mb-3 text-center",type:"text",placeholder:"Room ID",value:W,onChange:e=>z(e.target.value)}),(0,h.jsx)(x.Z,{className:"w-50 mx-auto",size:"sm",variant:"primary",onClick:()=>{a.emit("create_room",{room:W}),a.emit("join_room",{room:W,username:c||"Client"}),z(randomRoomId())},disabled:!0!==l||Q,children:"Create"})]})})]})]}),(0,h.jsx)(G.Provider,{value:{socket:a,serverUrl:n,isConnected:l,roleInfo:d,currentRoom:q,myRoles:[...b]},children:t}),(0,h.jsxs)(f.Z,{show:!!Y,onHide:()=>$(""),children:[(0,h.jsx)(f.Z.Header,{closeButton:!0,children:(0,h.jsx)(f.Z.Title,{children:V||"Error"})}),(0,h.jsx)(f.Z.Body,{children:(0,h.jsx)("p",{children:Y})})]})]})};var B=s(7176);(n=i||(i={})).OCEAN="Ocean",n.MOUNTAIN="Mountain",n.PLAINS="Plains",n.WOODS="Woods",n.MESA="Mesa";let H={Ocean:"\uD83C\uDF0A",Mountain:"⛰️",Plains:"\uD83C\uDF3E",Woods:"\uD83C\uDF32",Mesa:"\uD83C\uDFDC️"};(r=c||(c={})).EARTHQUAKE="Earthquake",r.FIRE="Fire",r.FLOOD="Flood",r.WINDSTORM="Windstorm",(a=m||(m={}))[a.UP=0]="UP",a[a.DOWN=1]="DOWN",a[a.FOREIGN_AID=2]="FOREIGN_AID",a[a.CLIMATE_GHOST=3]="CLIMATE_GHOST",a[a.END_TURN=4]="END_TURN",a[a.RENAME_REGION=5]="RENAME_REGION";var P=s(7769),L=s(3967),U=s.n(L),W=s(619),selected_region_panel=e=>{let{className:t}=e,{socket:s,myRoles:n}=(0,p.useContext)(G),{state:r,currentRegion:a,selectedRegion:o,currentPlayer:l,myTurn:i,operators:c,nameForPlayer:d}=(0,p.useContext)(et),[u]=(0,W.Z)("/earth-health-game/audio/EarthHealthExploit.mp3"),[j]=(0,W.Z)("/earth-health-game/audio/EarthHealthHeal.mp3");return a&&(0,h.jsxs)(g.Z,{className:U()("shadow-lg w-25 p-3 pointer-events-auto",t),children:[(0,h.jsxs)("h2",{className:"text-center",children:[a.name,n.includes(a.current_player)&&(0,h.jsx)(x.Z,{size:"sm",variant:"outline-primary",className:"border-0",onClick:()=>{let e=prompt("Choose a new name for this region",a.name);e&&e!==a.name&&s.emit("operator_chosen",{op_no:m.RENAME_REGION,params:[a.id,e]})},children:(0,h.jsx)(P.Z,{})})]}),(0,h.jsxs)(w.Z,{className:"fs-5 g-2 row-cols-2",children:[a.health>0&&(0,h.jsxs)(_.Z,{children:["Owned by: ",d(a.current_player)]}),(0,h.jsxs)(_.Z,{children:["Region Type: ",a.region_type._value_,H[a.region_type._value_]]}),(0,h.jsxs)(_.Z,{children:["Health:"," ",a.health>0?"".concat(a.health,"❤️"):"\uD83D\uDC80"]})]}),(0,h.jsx)("h3",{className:"text-center",children:"Actions"}),(0,h.jsxs)(w.Z,{className:"row-cols-1 g-2 justify-content-center",children:[!i&&(0,h.jsx)(_.Z,{children:"Not your turn."}),a.id in l.current_actions?(0,h.jsx)(_.Z,{children:"Already taken action this turn."}):(0,h.jsx)(h.Fragment,{children:c.filter(e=>{switch(e.op_no){case m.UP:case m.DOWN:return a.current_player==r.current_player;case m.FOREIGN_AID:return a.health>0&&a.current_player!==r.current_player;default:return!1}}).map(e=>(0,h.jsx)(_.Z,{xs:"auto",children:(0,h.jsx)(x.Z,{onClick:()=>{switch(s.emit("operator_chosen",{op_no:e.op_no,params:[o]}),e.op_no){case m.UP:j();break;case m.DOWN:u()}},children:e.name})}))})]})]})},end_turn_panel=e=>{let{className:t}=e,{socket:s}=(0,p.useContext)(G),{state:n,currentPlayer:r,operators:a,nameForPlayer:o,myTurn:l}=(0,p.useContext)(et),i=a.find(e=>e.op_no===m.CLIMATE_GHOST);return(0,h.jsx)(g.Z,{className:U()("shadow-lg w-auto p-3",t),children:(0,h.jsx)("h3",{className:"text-center pointer-events-auto",children:a.length>0?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)("div",{children:"It is your turn."}),i&&(0,h.jsx)(x.Z,{className:"mt-3 w-100",variant:"warning",onClick:()=>s.emit("operator_chosen",{op_no:m.CLIMATE_GHOST,params:null}),children:i.name}),(0,h.jsx)(x.Z,{className:"mt-3 w-100",variant:n.world.regions.some(e=>e.current_player===n.current_player&&!(e.id in r.current_actions))?"primary":"success",onClick:()=>s.emit("operator_chosen",{op_no:m.END_TURN,params:null}),children:"End Turn"})]}):"".concat(o(n.current_player)," is acting.")})})};(o=d||(d={})).RED="#C0392B",o.GREEN="#27AE60",o.YELLOW="#F1C40F",o.BLUE="#2980B9",o.MAGENTA="#8E44AD",o.CYAN="#17C4C4",o.WHITE="#ECF0F1",o.ORANGE="#E67E22",o.PURPLE="#9B59B6";let z={[i.MESA]:"#C0392B",[i.MOUNTAIN]:"#17C4C4",[i.OCEAN]:"#2980B9",[i.PLAINS]:"#F1C40F",[i.WOODS]:"#27AE60"};c.EARTHQUAKE,c.FIRE,c.FLOOD,c.WINDSTORM;let K={91:"#C0392B",92:"#27AE60",93:"#F1C40F",94:"#2980B9",95:"#8E44AD",96:"#17C4C4",97:"#ECF0F1",33:"#E67E22",105:"#9B59B6"},ansiToHtml=e=>(e=(e=e.replace(/\x1b\[(\d+)m/g,(e,t)=>{let s=K[t];return s?'<span style="color:'.concat(s,'">'):"0"===t?"</span>":e})).replace(/\n/g,"<br><br>"),"<div>".concat(e,"</div>")),J=["#C0392B","#27AE60","#8E44AD","#E67E22","#17C4C4"];var state_info_panel=e=>{let{className:t}=e,{myRoles:s}=(0,p.useContext)(G),{state:n,nameForPlayer:r}=(0,p.useContext)(et);return(0,h.jsxs)(g.Z,{className:U()("shadow-lg w-25 p-3 overflow-y-auto pointer-events-auto",t),style:{maxHeight:"80vh"},children:[(0,h.jsx)("h3",{className:"text-center",children:"State Info"}),(0,h.jsxs)(w.Z,{className:"row-cols-1 g-2",children:[(0,h.jsxs)(_.Z,{children:["Time: ",displayTime(n.time)]}),(0,h.jsxs)(_.Z,{children:["Climate Badness: ",n.global_badness]})]}),n.players.some(e=>s.includes(e.player_id)&&e.regions_owned<=0)&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)("h3",{className:"text-center my-3",children:"Next Possible Disasters"}),(0,h.jsx)(w.Z,{className:"row-cols-1 g-3",children:n.disaster_buffer.map((e,t)=>(0,h.jsxs)(_.Z,{children:[e.disaster._value_," in ",e.region," (",e.damage," damage)"]},t))})]}),(0,h.jsx)("h3",{className:"text-center my-3",children:"Player Info"}),(0,h.jsx)(w.Z,{className:"row-cols-1 g-3",children:n.players.map((e,t)=>(0,h.jsx)(_.Z,{children:(0,h.jsxs)(w.Z,{className:"row-cols-1 p-2 g-2 rounded-2",style:{border:".5rem ".concat(J[t]," solid")},children:[(0,h.jsxs)(_.Z,{children:[r(t),": ",displayMoney(e.money)]}),Object.values(n.world.regions).filter(t=>t.current_player===e.player_id).map((e,t)=>(0,h.jsxs)(_.Z,{className:"ms-4",children:[e.name," (",e.region_type._value_,H[e.region_type._value_],", ",e.health,"❤️)"]},t))]})},t))})]})};(l=u||(u={})).ByOwner="By Owner",l.ByRegionType="By Region Type",l.ByHealth="By Health";var visual_options_panel=e=>{let{className:t}=e,{options:{colorMode:s,setColorMode:n}}=(0,p.useContext)(et);return(0,h.jsx)(g.Z,{className:U()("position-absolute shadow-lg w-auto p-3",t),children:(0,h.jsx)(w.Z,{className:"row-cols-1 g-3 pointer-events-auto",children:(0,h.jsxs)(_.Z,{className:"d-flex flex-row align-items-center",children:[(0,h.jsx)("span",{className:"me-3",children:"Region Color Mode"}),(0,h.jsxs)(y.Z,{children:[(0,h.jsx)(C.Z,{size:"sm",children:s}),(0,h.jsx)(Z.Z,{children:Object.values(u).map(e=>(0,h.jsx)(N.Z,{active:e===s,onClick:()=>n(e),children:e},e))})]})]})})})},transitions_model=e=>{let{text:t,title:s,onHide:n}=e;return(0,h.jsxs)(f.Z,{size:"lg",show:!!t,onHide:n,backdrop:"static",className:"user-select-none",children:[(0,h.jsx)(f.Z.Header,{closeButton:!0,children:(0,h.jsx)(f.Z.Title,{children:s})}),(0,h.jsx)(f.Z.Body,{children:(0,h.jsx)("p",{dangerouslySetInnerHTML:{__html:ansiToHtml(t||"")}})})]})},q=s(7172),Q=s(6409),V=s(5929),X=s(9591),region_geography=e=>{let{geo:t}=e,{state:s,selectedRegion:n,setSelectedRegion:r,myTurn:a,currentPlayer:o,options:{colorMode:l}}=(0,p.useContext)(et),i=regionForGeo(t,s),c="#666";if(i.health>0)switch(l){case u.ByRegionType:c=z[i.region_type._value_];break;case u.ByOwner:c=J[i.current_player];break;case u.ByHealth:c=(0,V.Z)(d.RED,d.GREEN)(i.health/10)}let m=i.id===n,x=a&&i.current_player===s.current_player&&!(i.id in o.current_actions)&&i.health>0;return(0,h.jsx)(q.Geography,{geography:t,fill:c,style:{default:{stroke:m?"#FFF":x?"#0F0":"#666",strokeWidth:1,outline:"none"},hover:{stroke:m?"#FFF":x?"#0F0":"#666",strokeWidth:1,fill:(0,X.ZP)(c,"#FFF")(.2),outline:"none"}},onClick:e=>{e.stopPropagation(),r(m?-1:i.id)}})},Y=s(8540),region_marker=e=>{let{geo:t}=e,{state:s}=(0,p.useContext)(et),n=regionForGeo(t,s),r=(0,Y.Z)(t);return(0,h.jsxs)(q.Marker,{coordinates:r,className:"pointer-events-none",children:[(0,h.jsx)("text",{textAnchor:"middle",y:-2,style:{fontFamily:"system-ui",fontWeight:"bold",fontSize:5,fill:"#000"},stroke:"#FFF",strokeWidth:.2,children:n.name}),(0,h.jsx)("text",{textAnchor:"middle",y:4,style:{fontFamily:"system-ui",fontWeight:"bold",fontSize:5,fill:"#000"},stroke:"#FFF",strokeWidth:.2,children:n.health>0?(0,h.jsxs)(h.Fragment,{children:[n.health,"❤️",H[n.region_type._value_]]}):(0,h.jsx)(h.Fragment,{children:"\uD83D\uDC80"})})]})};let regionForGeo=(e,t)=>{let s=parseInt(e.rsmKey.replace("geo-",""));return t.world.regions[s]};var game_map=()=>{let e=(0,Q.g)()||1e3,{state:t,currentPlayer:s,selectedRegion:n,setSelectedRegion:r}=(0,p.useContext)(et),reorderGeos=e=>M().chain(e).filter((e,s)=>s<t.world.region_count).orderBy([e=>regionForGeo(e,t).id===n,e=>regionForGeo(e,t).current_player===t.current_player,e=>!(regionForGeo(e,t).id in s.current_actions)]).value();return(0,h.jsx)(q.ComposableMap,{height:1e3,width:2e3,style:{background:z[i.OCEAN],height:e,width:"100%"},onClick:()=>r(-1),children:(0,h.jsx)(q.ZoomableGroup,{center:[0,0],zoom:4,minZoom:3,children:(0,h.jsx)(q.Geographies,{geography:"/earth-health-game/map.geo.json",children:e=>{let{geographies:t}=e,s=reorderGeos(t);return s.map(e=>(0,h.jsx)(region_geography,{geo:e},e.rsmKey+"Geography")).concat(s.map(e=>(0,h.jsx)(region_marker,{geo:e},e.rsmKey+"Marker")))}})})})};let logMessageForOperator=(e,t,s)=>{let n="".concat(t," has ");switch(e.op_no){case m.UP:case m.DOWN:case m.FOREIGN_AID:case m.RENAME_REGION:let r=s.world.regions[e.params[0]];switch(e.op_no){case m.UP:n+="exploited ".concat(r.name,".");break;case m.DOWN:n+="healed ".concat(r.name,".");break;case m.FOREIGN_AID:n+="sent foreign aid to ".concat(r.name,".");break;case m.RENAME_REGION:n+="renamed ".concat(r.name," to ").concat(e.params[1],".")}break;case m.CLIMATE_GHOST:n+="has tipped the scales from beyond the grave.";break;case m.END_TURN:n+="ended their turn."}return n},logsForTransitions=(e,t)=>{let s=[];if(!e||e.time===t.time)return s;for(let e of t.current_disasters)s.push({time:t.time,message:"".concat(e.disaster._value_," in ").concat(e.region," (").concat(e.damage," damage)")});for(let r of t.world.regions){var n;r.health<=0&&(null!==(n=null==e?void 0:e.world.regions[r.id].health)&&void 0!==n?n:0)>0&&s.push({time:t.time,message:"".concat(r.name," was destroyed!")})}return s};var $=s(5472),ee=s.n($),game_log_panel=e=>{let{className:t,gameLogs:s}=e,[n,r]=(0,p.useState)(!1);return(0,h.jsxs)("div",{className:U()("w-50 h-25 text-center",t),children:[n&&(0,h.jsx)(g.Z,{className:"shadow-lg p-3 mb-5 h-100 overflow-y-scroll w-100 bottom-0 position-absolute d-flex flex-column-reverse pointer-events-auto",children:(0,h.jsx)("table",{children:ee()(s,e=>e.time).map((e,t)=>{let{time:s,message:n}=e;return(0,h.jsxs)("tr",{children:[(0,h.jsx)("td",{children:displayTime(s)}),(0,h.jsx)("td",{children:n})]},t)})})}),(0,h.jsx)(x.Z,{variant:"outline-dark",className:"border-0 fs-4 pointer-events-auto bottom-0 position-absolute",onClick:()=>r(!n),children:"Logs"})]})};let displayTime=e=>2050+10*e,displayMoney=e=>"$".concat(e,"M"),et=(0,p.createContext)(void 0);var game=()=>{let{socket:e,currentRoom:t,roleInfo:s,myRoles:n}=(0,p.useContext)(G),[r,a]=(0,p.useState)(void 0),[o,l]=(0,p.useState)([]),[i,c]=(0,p.useState)(!1),[m,d]=(0,p.useState)(-1),[x,g]=(0,R.Z)([]),[_,j]=(0,R.Z)([]),[y,N]=(0,p.useState)(void 0),[v,Z]=(0,p.useState)(u.ByOwner),C=(0,p.useMemo)(()=>t&&s?s.map((e,s)=>{var n;return(null===(n=t.players.find(e=>e.roles.includes(s)))||void 0===n?void 0:n.name)||"Unknown"}):[],[t,s]),E=m<0||!r?void 0:r.world.regions[m],f=null==r?void 0:r.players[null==r?void 0:r.current_player],w=!!r&&n.includes(r.current_player),nameForPlayer=e=>{var t;return"".concat(null==s?void 0:null===(t=s[e])||void 0===t?void 0:t.name," (").concat(C[e],")")},[b]=(0,W.Z)("/earth-health-game/audio/EarthHealthTurnStart.mp3"),F=(0,B.Z)(r);return(0,p.useEffect)(()=>{r&&(null==F?void 0:F.current_player)!==r.current_player&&n.includes(r.current_player)&&b()},[r,n]),(0,p.useEffect)(()=>{e&&(e.on("game_started",e=>{e.state&&(a(JSON.parse(e.state)),_.push({time:0,message:"The game has started!"}))}),e.on("operators_available",e=>{l(e.operators)}),e.on("operator_applied",e=>{e.state&&a(t=>{var s,n;N({...e.operator,player:null!==(s=null==t?void 0:t.current_player)&&void 0!==s?s:0,time:null!==(n=null==t?void 0:t.time)&&void 0!==n?n:0});let r=JSON.parse(e.state);return j.push(...logsForTransitions(t,r)),r})}),e.on("transition",e=>{let{message:t}=e;g.push(t)}),e.on("game_ended",e=>{let{message:t}=e;g.push(t),c(!0)}))},[e]),(0,p.useEffect)(()=>{y&&j.push({time:y.time,message:logMessageForOperator(y,nameForPlayer(y.player),r)})},[y]),(0,h.jsx)("div",{className:"h-auto user-select-none",children:r&&(0,h.jsx)(et.Provider,{value:{state:r,operators:o,namesByRole:C,selectedRegion:m,setSelectedRegion:d,currentRegion:E,currentPlayer:f,myTurn:w,nameForPlayer,options:{colorMode:v,setColorMode:Z}},children:(0,h.jsxs)("div",{className:"overflow-hidden position-relative d-flex",children:[(0,h.jsx)(game_map,{}),(0,h.jsxs)("div",{className:"position-absolute w-100 h-100 pointer-events-none",children:[(0,h.jsx)(state_info_panel,{className:"position-absolute top-0 start-0 m-4"}),(0,h.jsx)(selected_region_panel,{className:"position-absolute top-0 end-0 m-4"}),(0,h.jsx)(end_turn_panel,{className:"position-absolute bottom-0 end-0 m-4"}),(0,h.jsx)(visual_options_panel,{className:"position-absolute bottom-0 start-0 m-4"}),(0,h.jsx)(game_log_panel,{className:"position-absolute bottom-0 absolute-centered-x m-4",gameLogs:_}),(0,h.jsx)(transitions_model,{text:x.length>0?x[0]:void 0,title:i?"Game Over!":"Transition",onHide:()=>{g.removeAt(0)}})]})]})})})},pages=()=>(0,h.jsx)(h.Fragment,{children:(0,h.jsx)(SocketIOCommon,{title:"Collaborative Climate Contest",children:(0,h.jsx)(game,{})})})}},function(e){e.O(0,[662,805,774,888,179],function(){return e(e.s=8312)}),_N_E=e.O()}]);