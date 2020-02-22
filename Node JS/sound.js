const Speaker = require('speaker')
const easymidi = require('easymidi')
const NanoTimer = require('nanotimer')
const readline = require('readline')

const sampleRate= 16000
const bufferSize= 16
const y_synthLoopRepeatIndex= 1

let detune= 0.02

let yTable= [  
0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
2.625,  2.77,   2.91,   3.105,  3.299,  3.495,  3.7,    3.92,   4.1555, 4.3975, 4.661,  4.941,
5.232,  0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
]

let y= 2.625

const a2 = (t) => {
    // Pads
    let y1= y*t/16;
    let y2= y*t/8;
    let s=
    y1*(1+detune)%80 + y2%80
    // + // Detune (0.98 + 1.0) 
    // (
        //w>>7&&a*(
            //(3*t%m*a&128)*(0x82282222>>w_drm/4&1) // Kick
            // +
            // (d&127)*(0xa444c444 >> w/4&1)*1.5 // Snare
            // +
            // (d*w&1) // Noise ??
            // +
            // ( h%k+h*1.99%k+.49%k+h*.07%k-64)*(4-a-a) // Melody + bass
        // )
    // );
    return (s*s >> 14?127:s);
}

const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: sampleRate,
  float:true,
  samplesPerFrame:1
});

//process.stdout.pipe(speaker);

let t= 0
let intervalHandle
let a= 0


const timer = new NanoTimer()
let ar= [0,0,0,0]
const sampleOut = () => {
    ar[0]= a2(t++)
    ar[1]= a2(t++)
    ar[2]= a2(t++)
    ar[3]= a2(t++)
    speaker.write(Buffer.from(ar))
}

inputs = easymidi.getInputs()

if (inputs.length > 0) {
	const input = new easymidi.Input(inputs[0])
	//timer.setInterval(sampleOut, '', '62500n')
	input.on('noteon', function (msg) {
	    // do something with msg
	    y= yTable[msg.note]
	    t= 0
	    timer.setInterval(sampleOut, '', '125u')
	    //speaker.on('flush', sampleOut)
	    //sampleOut()
	    //console.log('noteon', msg)
	})
	input.on('noteoff', function (msg) {
	    // do something with msg
	    timer.clearInterval();
	    //console.log('noteoff', msg)
	})
}
else {
	timer.setInterval(sampleOut, '', '125u')
}

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let mode= 'none'

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    //console.log(key);
    if (mode === 'detune') {
        if (key.name === 'up') {
            detune+= 0.005
            console.log(detune)
        }
        else if (key.name === 'down') {
            detune-= 0.005
            console.log(detune)
        }
    }
    else if (mode === 'tune') {
        if (key.name === 'up') {
            y+= 0.001
            console.log(y)
        }
        else if (key.name === 'down') {
            y-= 0.001
            console.log(y)
        }
    }
  }
})

rl.on('line', (input) => {
    if (input === 'tune') {
        mode= 'tune'
    }
    else if (input === 'detune') {
        mode= 'detune'
        console.log(detune)
    }
  //y= parseFloat(input)
})
