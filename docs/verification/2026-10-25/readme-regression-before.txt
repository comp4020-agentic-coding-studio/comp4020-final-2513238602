
 RUN  v5.0.1 <repository>

 ❯ spec/readme-content.test.ts (1 test | 1 failed) 91ms
   × serves the full README argument and source links without requiring JavaScript 90ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  spec/readme-content.test.ts > serves the full README argument and source links without requiring JavaScript
AssertionError: README link must open: /readme/docs/after-hours-verification.md: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ spec/readme-content.test.ts:25:75
     23|     if (destination.origin === new URL(inject('baseUrl')).origin) {
     24|       const linked = await fetch(destination);
     25|       expect(linked.ok, `README link must open: ${destination.pathname…
       |                                                                           ^
     26|     }
     27|   }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  17:41:36
   Duration  770ms (import 84%, tests 14%, transform 2%)


