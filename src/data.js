var SortedMap = require("collections/sorted-map");

var sum = 0;
var sumSquares = 0;
var count = 0;
var dateImported = Date.now();
var dateStarted = null;
var dateStopped = null;

var socket = null;

var dataMap = new SortedMap();

export function getStats() {
    const mean = sum/count;
    console.log(sumSquares, sum, mean, count)
    const sd = Math.sqrt( (sumSquares - 2*mean*sum + count*mean*mean) / count );

    const max = dataMap.max();
    // const iter = dataMap.entries();
    // var res = iter.next();
    var mode = [];
    var modeCount = 0;
    var median = -1;
    // var t = (dataMap.sum()+1)/2;
    // while(!res.done) {
    //     // median
    //     if (median === -1) {
    //         if (t > res.value[1]) {
    //             t -= res.value[1];
    //         } else {
    //             median = res.value[0];
    //         }
    //     }

    //     // mode
    //     if (res.value[1] === max) {
    //         mode.push( res.value[0] );
    //         modeCount = res.value[1];
    //     }

    //     res = iter.next();
    // }

    return {
        'sum': sum,
        'count': count, 
        'mean': mean,
        'sd': sd,
        'median': median,
        'mode': mode,
        'modeCount': max
    };
}

export function start() {
    dateStarted = Date.now();

    socket = new WebSocket('wss://trade.trademux.net:8800/?password=1234');

    socket.addEventListener('message', function (event) {
        // console.log('Message from server ', event.data);
        const val = JSON.parse(event.data).value;
        const valCount = dataMap.get(val);
        if (valCount === undefined) {
            dataMap.set( val, 1);
        } else {
            dataMap.set( val, valCount+1 );
        }
        sum += val;
        sumSquares += val*val;
        count++;
    });

    socket.addEventListener('error', function (event) {
        console.log('Error occured: ', event.data);
    });
}

export function stop() {
    if (socket !== null) {
        socket.close();
    }
    dateStopped = Date.now();
}