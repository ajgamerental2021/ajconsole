import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('calendar clear control is bilingual and clears both committed dates',()=>{
  assert.match(source,/id=\"calendarClear\"/);
  assert.match(source,/calClear:\"ล้างวันที่ที่เลือก\"/);
  assert.match(source,/calClear:\"Clear selected dates\"/);
  const start=source.indexOf('  function clearCalendarRange()');
  const body=source.slice(start,source.indexOf('\n  }',start));
  assert.match(body,/state\.calc\.start = \"\"/);
  assert.match(body,/state\.calc\.end = \"\"/);
  assert.match(body,/releaseBookingHold\(previousCode\)/);
});
test('payment selection updates the guide without moving to step 3',()=>{
  const payment=source.slice(source.indexOf('if(event.target.dataset.paymentChoice)'),source.indexOf('if(event.target.id === \"laterOpt\")'));
  assert.match(payment,/setGuideStage\(\"next3\", \{syncStep:false\}\)/);
  assert.doesNotMatch(payment,/state\.calc\.step\s*=\s*3/);
});
