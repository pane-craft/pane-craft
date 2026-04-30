import{n as e}from"./chunk-BneVvdWh.js";import{n as t,t as n}from"./Tab-BADbyOQD.js";var r,i,a,o,s,c,l,u,d,f,p;e((()=>{t(),r={title:`Core/Tab`,component:n,parameters:{layout:`centered`},tags:[`autodocs`],argTypes:{id:{control:`number`},label:{control:`text`},isActive:{control:`boolean`},isDragged:{control:`boolean`},dropTargetSide:{control:`select`,options:[null,`left`,`right`]},isCloseable:{control:`boolean`},onClose:{},className:{control:`text`}}},i={args:{id:0,label:`Default Tab`}},a={args:{id:1,label:`Active Tab`,isActive:!0}},o={args:{id:10,label:`Close Callback`,onClose:e=>{console.log(`close`,e)}}},s={args:{id:11,label:`Without Close`,isCloseable:!1}},c={args:{id:20,label:`Dragging`,isDragged:!0}},l={args:{id:21,label:`Dropping Left`,isActive:!1,isDragged:!1,dropTargetSide:`left`,isCloseable:!1}},u={args:{id:22,label:`Dropping Right`,isActive:!1,isDragged:!1,dropTargetSide:`right`,isCloseable:!1}},d={args:{id:30,label:`A11y Override`,a11y:{tabIndex:1,"aria-label":`test-label`}}},f={args:{id:40,label:`A longer label that overflows`}},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    id: 0,
    label: 'Default Tab'
  }
}`,...i.parameters?.docs?.source},description:{story:`The default resting state — inactive, not being dragged, no close callback.`,...i.parameters?.docs?.description}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    id: 1,
    label: 'Active Tab',
    isActive: true
  }
}`,...a.parameters?.docs?.source},description:{story:`The currently selected tab. Rendered with a colored top-border accent and a\r
lighter background.`,...a.parameters?.docs?.description}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    id: 10,
    label: 'Close Callback',
    onClose: id => {
      console.log('close', id);
    }
  }
}`,...o.parameters?.docs?.source},description:{story:'An inactive tab with a close button and callback. The close button carries\r\nan `aria-label` of `"Close ${label}"` so screen readers announce the target.',...o.parameters?.docs?.description}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    id: 11,
    label: 'Without Close',
    isCloseable: false
  }
}`,...s.parameters?.docs?.source},description:{story:'A "pinned" tab — `isCloseable={false}` removes the close button entirely so\r\nthe tab cannot be dismissed by the user.',...s.parameters?.docs?.description}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    id: 20,
    label: 'Dragging',
    isDragged: true
  }
}`,...c.parameters?.docs?.source},description:{story:`The tab the user is currently dragging.\r

Rendered dimmed and slightly larger. Your controller should set\r
\`isDragged={true}\` on the source tab while a drag is in progress.`,...c.parameters?.docs?.description}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    id: 21,
    label: 'Dropping Left',
    isActive: false,
    isDragged: false,
    dropTargetSide: 'left',
    isCloseable: false
  }
}`,...l.parameters?.docs?.source},description:{story:`A drop target with the indicator on the **left** edge.\r

A tab becomes a drop target when the user is dragging a different tab on top\r
of this tab. Use when the dragged tab is hovering over the left half of this\r
tab, indicating it will be inserted to the left.`,...l.parameters?.docs?.description}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    id: 22,
    label: 'Dropping Right',
    isActive: false,
    isDragged: false,
    dropTargetSide: 'right',
    isCloseable: false
  }
}`,...u.parameters?.docs?.source},description:{story:`A drop target with the indicator on the **right** edge.\r

A tab becomes a drop target when the user is dragging a different tab on top\r
of this tab. Use when the dragged tab is hovering over the right half of this\r
tab, indicating it will be inserted to the right.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    id: 30,
    label: 'A11y Override',
    a11y: {
      tabIndex: 1,
      'aria-label': 'test-label'
    }
  }
}`,...d.parameters?.docs?.source},description:{story:'Demonstrates the `a11y` prop, which passes ARIA properties to the root `div`\r\nelement of the tab. Consumers can override default values or forward\r\nadditional properties. The default values `Tab` uses are:\r\n\n- `role="tab"` — identifies the element as a tab control\r\n- `aria-selected` — based on `isActive`, tells assistive technology knows\r\n  which tab is current\r\n- `tabIndex` — `0` for the active tab, `-1` for all others\r\n\nSee APG Tabs Pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) for\r\nmore information.',...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    id: 40,
    label: 'A longer label that overflows'
  }
}`,...f.parameters?.docs?.source},description:{story:"A title long enough to overflow the tab's `max-width`, appending an ellipsis\r\nvia CSS `text-overflow`.",...f.parameters?.docs?.description}}},p=[`Default`,`Active`,`WithCloseCallback`,`WithoutClose`,`Dragging`,`DropTargetLeft`,`DropTargetRight`,`AccessibilityOverride`,`LongLabel`]}))();export{d as AccessibilityOverride,a as Active,i as Default,c as Dragging,l as DropTargetLeft,u as DropTargetRight,f as LongLabel,o as WithCloseCallback,s as WithoutClose,p as __namedExportsOrder,r as default};