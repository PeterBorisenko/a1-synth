const Speaker = require('speaker');

const a2 = (t) => {
    let w= t>>9;
    let k= 32;
    let m= 2048;
    let a= 1-t/m%1;
    let d=(14*t*t^t)%m*a;
    let y= [3,3,4.7,2][p=w/k&3]*t/4;
    let h= "IQNNNN!!]]!Q!IW]WQNN??!!W]WQNNN?".charCodeAt(w/2&15|p/3<<4)/33*t-t;
    let s= y*.98%80+y%80+(w>>7&&a*((5*t%m*a&128)*(0x53232323>>w/4&1)+
        (d&127)*(0xa444c444 >> w/4&1)*1.5+(d*w&1)+(h%k+h*1.99%k+.49%k
        +h*.07%k-64)*(4-a-a)));
    return s*s >> 14?127:s;
}

const speaker = new Speaker({
  channels: 1,          // 2 channels
  bitDepth: 16,         // 16-bit samples
  sampleRate: 4000     // 44,100 Hz sample rate
});

//process.stdout.pipe(speaker);

let t= 0

setInterval(() => {
    let ar= []
    for( let i= 0; i < 16000; i++) {
        ar[i]= a2(t++)
    }
    speaker.write(Buffer.from(ar))
}, 1000);