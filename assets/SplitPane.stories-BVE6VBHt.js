import{a as e,n as t}from"./chunk-BneVvdWh.js";import{n,t as r,w as i}from"./iframe-CNGQcbtn.js";import{t as a}from"./jsx-runtime-D16BNjX-.js";import{i as o,r as s}from"./defaults-Bdo9jPl5.js";import{i as c,n as l,r as u,t as d}from"./PaneSplitter-tNHPTNHh.js";var f,p,m,h,g,_=t((()=>{f=`pc_splitPane_mlkwD9`,p=`pc_splitPaneHorizontal_FXbOaO`,m=`pc_splitPaneVertical_MoFPx8`,h=`pc_pane_tz3FMv`,g={splitPane:f,splitPaneHorizontal:p,splitPaneVertical:m,pane:h}})),v,y,b,x=t((()=>{v=e(i(),1),o(),n(),r(),c(),l(),_(),y=a(),b=({firstSubPane:e,secondSubPane:t,orientation:n=s.orientation,firstSize:r,onResize:i,minSize:a=s.minSize,maxSize:o=s.maxSize,disabled:c=s.disabled,className:l=``,firstClassName:f,secondClassName:p,splitterClassName:m,a11y:h={}})=>{let _=(0,v.useRef)(null),b=(0,v.useRef)(r),x=(0,v.useCallback)(()=>{b.current=r},[r]),S=(0,v.useCallback)(e=>{if(!i||!_.current)return;let t=_.current.getBoundingClientRect(),r=n===`horizontal`?t.width:t.height;if(r<=0)return;let s=e/r*100;i(u(b.current+s,a,o))},[i,n,a,o]),C=(0,v.useCallback)(e=>{i&&i(u(r+e,a,o))},[i,r,a,o]),w=[g.splitPane,n===`horizontal`?g.splitPaneHorizontal:g.splitPaneVertical,l].filter(Boolean).join(` `),T=[g.pane,f].filter(Boolean).join(` `),E=[g.pane,p].filter(Boolean).join(` `),D={flex:`${r} 1 0`},O={flex:`${100-r} 1 0`};return(0,y.jsxs)(`div`,{ref:_,className:w,"data-testid":`split-pane`,"data-orientation":n,...h,children:[(0,y.jsx)(`div`,{className:T,style:D,"data-testid":`split-pane-first`,children:e}),(0,y.jsx)(d,{orientation:n,disabled:c||!i,onResizeStart:x,onDragResize:S,onKeyResize:C,ariaValueNow:Math.round(r),ariaValueMin:a,ariaValueMax:o,className:m}),(0,y.jsx)(`div`,{className:E,style:O,"data-testid":`split-pane-second`,children:t})]})};try{SplitPaneProps.displayName=`SplitPaneProps`,SplitPaneProps.__docgenInfo={description:`Props for the {@link SplitPane } component.`,displayName:`SplitPaneProps`,filePath:`D:/peter/Projects/pane-craft/src/components/SplitPane/SplitPane.tsx`,methods:[],props:{},tags:{remarks:`\`SplitPane\` is a binary resizable layout primitive: two children separated\r
by a draggable divider. It is fully controlled — the parent owns the\r
current {@link SplitPaneProps.firstSize } and receives updates through\r
{@link SplitPaneProps.onResize }. The component has no opinions about what\r
the children are; use it for editor/sidebar layouts, diff views,\r
documentation panes, or any other two-pane arrangement.\r
\r
For multi-pane tree layouts (recursive splits managed as state), see\r
{@link PaneTree } and {@link PaneTreeStateManager }.`}}}catch{}try{b.displayName=`SplitPane`,b.__docgenInfo={description:`Resizable layout controlling two panes separated by a draggable divider.`,displayName:`SplitPane`,filePath:`D:/peter/Projects/pane-craft/src/components/SplitPane/SplitPane.tsx`,methods:[],props:{className:{defaultValue:{value:``},declarations:[{fileName:`pane-craft/src/types/Base.type.ts`,name:`TypeLiteral`}],description:`Additional CSS class names merged onto the root element.`,name:`className`,required:!1,tags:{},type:{name:`string`}},a11y:{defaultValue:{value:`{}`},declarations:[{fileName:`pane-craft/src/types/Base.type.ts`,name:`TypeLiteral`}],description:`ARIA and accessibility attributes forwarded to the root element.`,name:`a11y`,required:!1,tags:{remarks:`Accepts any valid ARIA attribute (role, aria-*, tabIndex, etc.).\r
This lets consumers compose accessible patterns (e.g. tab lists)\r
without the component needing to know about them.`,example:"```tsx\r\n<Tab a11y={{ role: 'tab', tabIndex: 0, 'aria-selected': isActive }} />\r\n```"},type:{name:`(AriaAttributes & { role?: AriaRole; tabIndex?: number; }) | undefined`}},firstSubPane:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:`Content rendered in the first (left / top) sub-pane.`,name:`firstSubPane`,required:!0,tags:{},type:{name:`ReactNode`}},secondSubPane:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:`Content rendered in the second (right / bottom) sub-pane.`,name:`secondSubPane`,required:!0,tags:{},type:{name:`ReactNode`}},orientation:{defaultValue:{value:`horizontal`},declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:`Layout axis.`,name:`orientation`,required:!1,tags:{remarks:"- `'horizontal'` — sub-panes laid out side-by-side with a vertical\r\n  divider (`firstSize` controls the width of `firstSubPane`).\r\n- `'vertical'` — sub-panes stacked with a horizontal divider\r\n  (`firstSize` controls the height of `firstSubPane`).",default:`'horizontal'`},type:{name:`enum`,raw:`Orientation`,value:[{value:`"horizontal"`},{value:`"vertical"`}]}},firstSize:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:"Current size of the first sub-pane as a percentage (`0`–`100`) of the\ncontainer along its main axis.",name:`firstSize`,required:!0,tags:{remarks:`The component is fully controlled: it renders whatever value it is\r
given. Clamping against {@link SplitPaneProps.minSize } and\r
{@link SplitPaneProps.maxSize } is applied to the values emitted via\r
{@link SplitPaneProps.onResize }, so well-behaved callers never see\r
out-of-range values.`},type:{name:`number`}},onResize:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:`Called with the new size (in percent) whenever the user drags the
splitter or presses an arrow key on the focused splitter.`,name:`onResize`,required:!1,tags:{remarks:"The emitted value is already clamped to\r\n`[minSize, maxSize]`. Omit this prop to render a fixed (non-resizable)\r\nlayout at `firstSize`."},type:{name:`((firstSize: number) => void)`}},minSize:{defaultValue:{value:`10`},declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:`Minimum size of the first sub-pane as a percentage. Also caps the
maximum size of the second sub-pane.`,name:`minSize`,required:!1,tags:{default:`10`},type:{name:`number`}},maxSize:{defaultValue:{value:`90`},declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:`Maximum size of the first sub-pane as a percentage. Also caps the
minimum size of the second sub-pane.`,name:`maxSize`,required:!1,tags:{default:`90`},type:{name:`number`}},disabled:{defaultValue:{value:`false`},declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:"When `true`, disables the splitter: the layout still renders at\n`firstSize`, but dragging and arrow-key resizing are ignored.",name:`disabled`,required:!1,tags:{default:`false`},type:{name:`boolean`}},firstClassName:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:`Extra class name merged onto the first sub-pane's wrapper element.`,name:`firstClassName`,required:!1,tags:{},type:{name:`string`}},secondClassName:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:`Extra class name merged onto the second sub-pane's wrapper element.`,name:`secondClassName`,required:!1,tags:{},type:{name:`string`}},splitterClassName:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/SplitPane.type.ts`,name:`TypeLiteral`}],description:`Extra class name merged onto the splitter element.`,name:`splitterClassName`,required:!1,tags:{},type:{name:`string`}}},tags:{remarks:"`SplitPane` is a controlled, headless layout primitive. The parent owns\r\nthe split size (as a percentage of the container along the main axis)\r\nand receives drag/keyboard updates via `onResize`. The component can be used\r\nfor any two-pane interface and doesn't influence what the children are.",example:`A 30/70 horizontal split with a sidebar and an editor:\r
\`\`\`tsx\r
const [firstSize, setFirstSize] = useState(30);\r
\r
return (\r
  <SplitPane\r
    orientation="horizontal"\r
    firstSize={firstSize}\r
    onResize={setFirstSize}\r
    firstSubPane={<Sidebar />}\r
    secondSubPane={<Editor />}\r
  />\r
);\r
\`\`\`
A fixed (non-resizable) vertical split:\r
\`\`\`tsx\r
<SplitPane\r
  orientation="vertical"\r
  firstSize={70}\r
  disabled\r
  firstSubPane={<Preview />}\r
  secondSubPane={<Console />}\r
/>\r
\`\`\``,see:`{@link SplitPaneProps } for full prop documentation.`}}}catch{}})),S,C,w,T,E,D,O,k,A,j,M,N,P;t((()=>{S=e(i(),1),x(),C=a(),w={title:`Core/SplitPane`,component:b,parameters:{layout:`centered`},tags:[`autodocs`],argTypes:{orientation:{control:`inline-radio`,options:[`horizontal`,`vertical`]},minSize:{control:{type:`number`,min:0,max:100}},maxSize:{control:{type:`number`,min:0,max:100}},disabled:{control:`boolean`}}},T=e=>(0,C.jsx)(`div`,{style:{width:560,height:320,background:`#1e1e1e`,border:`1px solid #3c3c3c`},children:e}),E=(e,t)=>(0,C.jsx)(`div`,{style:{width:`100%`,height:`100%`,background:t,color:`#d4d4d4`,fontFamily:`ui-monospace, monospace`,fontSize:13,padding:12,boxSizing:`border-box`},children:e}),D=e=>{let[t,n]=(0,S.useState)(e.firstSize);return T((0,C.jsx)(b,{...e,firstSize:t,onResize:n}))},O={args:{orientation:`horizontal`,minSize:10,maxSize:90,firstSize:30,firstSubPane:E(`Sidebar (30%)`,`#252526`),secondSubPane:E(`Editor`,`#1e1e1e`)},render:D},k={args:{orientation:`vertical`,minSize:10,maxSize:90,firstSize:65,firstSubPane:E(`Content (65%)`,`#1e1e1e`),secondSubPane:E(`Console`,`#252526`)},render:D},A=e=>{let[t,n]=(0,S.useState)(25),[r,i]=(0,S.useState)(70);return T((0,C.jsx)(b,{...e,firstSize:t,onResize:n,firstSubPane:E(`Sidebar`,`#252526`),secondSubPane:(0,C.jsx)(b,{orientation:`vertical`,firstSize:r,onResize:i,firstSubPane:E(`Editor`,`#1e1e1e`),secondSubPane:E(`Terminal`,`#252526`)})}))},j={args:{orientation:`horizontal`,firstSize:25,firstSubPane:E(`Sidebar`,`#252526`),secondSubPane:null},render:A},M=e=>T((0,C.jsx)(b,{...e})),N={args:{orientation:`horizontal`,firstSize:40,disabled:!0,firstSubPane:E(`Locked 40%`,`#252526`),secondSubPane:E(`Locked 60%`,`#1e1e1e`)},render:M},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal',
    minSize: 10,
    maxSize: 90,
    firstSize: 30,
    firstSubPane: pane('Sidebar (30%)', '#252526'),
    secondSubPane: pane('Editor', '#1e1e1e')
  },
  render: ControlledPanelStory
}`,...O.parameters?.docs?.source},description:{story:`A horizontal split with an editor-style sidebar (30%) and main panel.\r
The size is owned by the story and passed as a controlled value.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical',
    minSize: 10,
    maxSize: 90,
    firstSize: 65,
    firstSubPane: pane('Content (65%)', '#1e1e1e'),
    secondSubPane: pane('Console', '#252526')
  },
  render: ControlledPanelStory
}`,...k.parameters?.docs?.source},description:{story:`A vertical split showing the main content on top and a console on the\r
bottom.`,...k.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal',
    firstSize: 25,
    firstSubPane: pane('Sidebar', '#252526'),
    secondSubPane: null
  },
  render: NestedStory
}`,...j.parameters?.docs?.source},description:{story:`A nested split: an outer horizontal split where the right pane is itself\r
a vertical split. Demonstrates that \`SplitPane\` composes cleanly without\r
any state manager.`,...j.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal',
    firstSize: 40,
    disabled: true,
    firstSubPane: pane('Locked 40%', '#252526'),
    secondSubPane: pane('Locked 60%', '#1e1e1e')
  },
  render: DisabledStory
}`,...N.parameters?.docs?.source},description:{story:"A read-only, fixed layout: the splitter is disabled so the 40/60 layout\r\ncan't be resized. Still announces its state via `aria-disabled`.",...N.parameters?.docs?.description}}},P=[`Horizontal`,`Vertical`,`Nested`,`Disabled`]}))();export{N as Disabled,O as Horizontal,j as Nested,k as Vertical,P as __namedExportsOrder,w as default};