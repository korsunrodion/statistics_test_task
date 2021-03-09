var Map = require("collections/map");

/*
    Данные из потока записываются в эти 4 коллекции. Нужно для рассчета медианы и моды.
    
    Описание алгоритма:
    <>
    You can use 2 heaps, that we will call Left and Right.
    Left is a Max-Heap.
    Right is a Min-Heap.
    Insertion is done like this:

    If the new element x is smaller than the root of Left then we insert x to Left.
    Else we insert x to Right.
    If after insertion Left has count of elements that is greater than 1 from the count of elements of Right, then we call Extract-Max on Left and insert it to Right.
    Else if after insertion Right has count of elements that is greater than the count of elements of Left, then we call Extract-Min on Right and insert it to Left.
    The median is always the root of Left. [здесь - либо корень левой, либо среднее из корней левой и правой]

    So insertion is done in O(lg n) time and getting the median is done in O(1) time.
    <>

    Т.к. при работе в течении нескольких дней значений будет очень много, используем массивы в которых хранятся только уникальные значения,
     и Map: (значение: кол-во вхождений)
 */
var leftArray = [];
var rightArray = [];
var leftCounts = new Map();
var rightCounts = new Map();

/*
    Сумма, сумма квадратов, кол-во values. Используется в рассчете среднего и отклонения для экономии времени.
*/
var sum = 0;
var sumSquares = 0;
var count = 0;

var valuesLost = 0;

var socket = null;

// формирование полного массива значений для дебага
// const fullArr = () => {
//     let result = [];
//     for (var i=0; i<leftArray.length; i++) {
//         let val = leftArray[i];
//         for (var j=0; j<leftCounts.get(val); j++) {
//             result.push(val);
//         }
//     }
//     for (var i2=0; i2<rightArray.length; i2++) {
//         let val = rightArray[i2];
//         for (var j2=0; j2<rightCounts.get(val); j2++) {
//             result.push(val);
//         }
//     }
//     return result;
// }

export function getStats() {
    const t1 = performance.now();

    const mean = sum/count;
    const sd = Math.sqrt( (sumSquares - 2*mean*sum + count*mean*mean) / count );
   
    // console.log(fullArr().sort());

    // либо в левом массиве на 1 значение больше, либо поровну
    var median;
    if (leftCounts.sum() === rightCounts.sum()) {
        median = (Math.max(...leftArray) + Math.min(...rightArray))/2;
    } else {
        median = Math.max(...leftArray);
    }

    let modeCount = 0;
    let mode = [];
    const it = leftCounts.keys();
    let res = it.next()
    let tmpCount;
    // проходка по всем уникальным значениями, получение суммы вхождений с обоих сторон, нахождение моды
    while (!res.done) {
        tmpCount = leftCounts.get(res.value) + rightCounts.get(res.value);
        if (tmpCount > modeCount) {
            modeCount = tmpCount;
            mode = [res.value];
        } else if (tmpCount === modeCount) {
            mode.push(res.value);
        }
        res = it.next();
    }

    // ограничиваем кол-во мод пятью
    if (mode.length > 5) {
        mode = mode.slice(0, 5);
    }

    const t2 = performance.now();

    return {
        'sum': sum,
        'count': count, 
        'mean': mean.toFixed(3),
        'sd': sd.toFixed(3),
        'median': median.toFixed(3),
        'mode': mode,
        'modeCount': modeCount,
        'losses': valuesLost,
        'timeSpent': (t2-t1).toFixed(5)
    };
}

// условное добавление в левую стороны
function addLeft(val) {
    let c = leftCounts.get(val);
    let c2 = rightCounts.get(val);
    if (c === undefined) {
        leftCounts.set(val, 1);
        c = 0;
    } else {
        leftCounts.set(val, c+1)
    }

    if (c2 === undefined) {
        rightCounts.set(val, 0);
    }

    if (c === 0) {
        leftArray.push(val);
    }
}

// условное добавление в правую сторону
function addRight(val) {
    let c = rightCounts.get(val);
    let c2 = leftCounts.get(val);
    if (c === undefined) {
        rightCounts.set(val, 1);
        c = 0;
    } else {
        rightCounts.set(val, c+1)
    }

    if (c2 === undefined) {
        leftCounts.set(val, 0);
    }

    if (c === 0) {
        rightArray.push(val);
    }
}

// условный перенос из правой в левую
function fromRightToLeft() {
    let index = rightArray.indexOf( Math.min(...rightArray) );
    let tmp = rightArray[index];

    if (rightCounts.get(tmp) === 1 && leftCounts.get(tmp) === 0) {
        rightArray.splice(index, 1);
        leftArray.push(tmp);
    } else if (rightCounts.get(tmp) === 1 && leftCounts.get(tmp) > 0) {
        rightArray.splice(index, 1);
    } else if (rightCounts.get(tmp) > 1 && leftCounts.get(tmp) === 0) {
        leftArray.push(tmp);
    }
    leftCounts.set( tmp, leftCounts.get(tmp)+1 );
    rightCounts.set( tmp, rightCounts.get(tmp)-1 );
}

// условный перенос из левой в правую
function fromLeftToRight() {
    let index = leftArray.indexOf( Math.max(...leftArray) );
    let tmp = leftArray[index];

    if (leftCounts.get(tmp) === 1 && rightCounts.get(tmp) === 0) {
        leftArray.splice(index, 1);
        rightArray.push(tmp);
    } else if (leftCounts.get(tmp) === 1 && rightCounts.get(tmp) > 0) {
        leftArray.splice(index, 1);
    } else if (leftCounts.get(tmp) > 1 && rightCounts.get(tmp) === 0) {
        rightArray.push(tmp);
    }
    leftCounts.set( tmp, leftCounts.get(tmp)-1 );
    rightCounts.set( tmp, rightCounts.get(tmp)+1 );
}

export function start() {
    socket = new WebSocket('wss://trade.trademux.net:8800/?password=1234');

    socket.addEventListener('message', function (event) {
        const val = JSON.parse(event.data).value;
        if (leftArray.length === 0 || val < Math.max(...leftArray)) {
            addLeft(val);
        } else {
            addRight(val);
        }

        const dif = leftCounts.sum() - rightCounts.sum();

        if (dif > 1) {
            fromLeftToRight();
        } else if (dif < 0) {
            fromRightToLeft();
        }

        sum += val;
        sumSquares += val*val;
        count++;
    });

    socket.addEventListener('error', function (event) {
        console.log('Error occured: ', event.data);
        valuesLost++;
    });
}

export function stop() {
    if (socket !== null) {
        socket.close(); 
    }

    leftArray = [];
    rightArray = [];
    leftCounts = new Map();
    rightCounts = new Map();

    sum = 0;
    sumSquares = 0;
    count = 0;

    socket = null;
}