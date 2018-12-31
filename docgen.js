// class A {
//     constructor(options) {
//         const settings = Object.assign({
//             //  @doc:settings:start
//             width: 400, // @doc:width: width of the div
//             height: 300, // @doc:height: height of the div
//             x: _ => {}, //@doc:x: x value
//             y: (a, b, c) => {}, //@doc:y: y value
//             z: function (x, y, z) {}, //@doc:z: z value
//             // @doc:settings:end
//         }, options);
//         this.settings = settings;
//     }

//     // @doc:method:start
//     f0() {
//         // @doc: f0 does some crazy things
//         // @doc:method:end

//     }

//     // @doc:method:start
//     f1(a = 1, b) {
//         // @doc: f1 does some cool things
//         // @doc:a: description of a
//         // @doc:b: description of b
//         // @doc:method:end

//         // @doc:event:start
//         // @doc:beforeSomething: this happens before something happens
//         // @doc:prop1: description of prop1
//         // @doc:prop2: description of prop2
//         // @doc:event:end
//         this.dispatchEvent(new CustomEvent('beforeSomething', {
//             detail: {
//                 prop1: true,
//                 prop2: false,
//             }
//         }));
//     }
//     // @doc:method:start
//     f2(x = 'abc') {
//         // @doc: f2 does some sneaky things
//         // @doc:x: description of x
//         // @doc:return: this function returns some fancy value.
//         // @doc:method:end
//     }
// }

// const classStr = A.toString();

const getRe = type => `\\/\\/\\s*@doc\\:${type}\\:start([\\s\\S]*?)\\/\\/\\s*@doc\\:${type}\\:end`;

const parseFunction = f => {
    const re = /(\(.*?\))/gm;
    const fstr = f.toString().trim();
    // console.log(fstr);
    let match = re.exec(fstr);
    if (match !== null) {
        return match[0];
    }
    return '()';
};

const parseMethods = str => {
    const ret = [];
    const re = new RegExp(getRe('method'), 'g');
    let match = re.exec(str);
    while (match !== null) {
        const method = {
            params: []
        };
        const s = match[1].trim();
        match = re.exec(str);

        // parse method name and parameters
        const re1 = /^(?!\s*\/\/\s*@doc\:).*/gm;
        let match1 = re1.exec(s);
        if (match1 !== null) {
            const s1 = match1[0].trim();
            const re2 = /(.*?)\s*\((.*?)\)/gm;
            let match2 = re2.exec(s1);
            if (match2 !== null) {
                const key = match2[1].trim();
                const dict = match2[2].trim();
                method.key = key;
                // method.dict = s2[2];
                if (dict.length > 0) {
                    eval.call(global, 'var ' + dict + ';');

                }
            }
        }

        // parse method docs
        let firstLine = true;
        const re2 = /\/\/\s*@doc\:(.*?)$/gm;
        let match2 = re2.exec(s);
        while (match2 !== null) {
            const s2 = match2[1].trim();
            match2 = re2.exec(s);
            if (firstLine) {
                method.desc = s2;
            } else {
                const parts = s2.split(/\:(.*)/);
                const key = parts[0].trim();
                const desc = parts[1].trim();
                if (key === 'return') {
                    method.returns = desc;
                } else {
                    method.params.push({
                        key,
                        desc,
                        defaultValue: global[key],
                        type: typeof global[key],
                    });
                }
            }
            firstLine = false;
        }
        ret.push(method);
    }
    return ret;
};

const parseSettings = str => {
    let ret = [];
    let json = 'var dict = {';
    const re = new RegExp(getRe('settings'), 'g');
    let match = re.exec(str);
    while (match !== null) {
        const s = match[1].trim();
        json += s;
        match = re.exec(str);

        const re1 = /\/\/\s*@doc\:(.*?)$/gm;
        let match1 = re1.exec(s);
        while (match1 !== null) {
            const s1 = match1[1].trim();
            match1 = re1.exec(s);
            ret.push(s1);
        }
    }
    json += '\n}';
    // console.log(json);
    eval(json);
    // console.log(dict);
    // console.log(ret);
    ret = ret.map(line => {
        const parts = line.split(/\:(.*)/);
        const key = parts[0].trim();
        const desc = parts[1].trim();
        const defaultValue = dict[key];
        const type = typeof dict[key];
        return {
            key,
            desc,
            defaultValue: type === 'function' ? parseFunction(defaultValue) : defaultValue,
            type,
        };
    });
    // console.log(ret);
    return ret;
};

const parseEvents = str => {
    const ret = [];
    const re = new RegExp(getRe('event'), 'g');
    let match = re.exec(str);
    while (match !== null) {
        const event = {
            params: []
        };
        const s = match[1].trim();
        match = re.exec(str);

        // parse method docs
        let firstLine = true;
        const re1 = /\/\/\s*@doc\:(.*?)$/gm;
        let match1 = re1.exec(s);
        while (match1 !== null) {
            const s1 = match1[1].trim();
            match1 = re1.exec(s);

            const parts = s1.split(/\:(.*)/);
            const key = parts[0].trim();
            const desc = parts[1].trim();
            if (firstLine) {
                event.key = key;
                event.desc = desc;
            } else {
                event.params.push({
                    key,
                    desc
                });
            }
            firstLine = false;
        }
        ret.push(event);
    }
    return ret;
};

const parse = str => {
    return {
        settings: parseSettings(str),
        methods: parseMethods(str),
        events: parseEvents(str),
    };
};

exports.parse = parse;

// console.log(JSON.stringify(parse(classStr)));