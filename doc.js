class A {
    constructor(options) {
        const settings = Object.assign({
            // azDoc:settings:start
            width: 400, // azDoc: width of the div
            height: 300, // azDoc: height of the div
            // azDoc:settings:end
        }, options);
        this.settings = settings;
    }

    // azDoc:method:start
    f0() {
        // azDoc: f0 does some crazy things
        // azDoc:method:end

    }

    // azDoc:method:start
    f1(a = 1, b) {
        // azDoc: f1 does some cool things
        // azDoc:a: description of a
        // azDoc:b: description of b
        // azDoc:method:end

        // azDoc:event:start
        // azDoc: this happens before something happens
        // azDoc:eventName: beforeSomething
        // azDoc:prop1: description of prop1
        // azDoc:prop2: description of prop2
        // azDoc:event:end
        this.dispatchEvent(new CustomEvent('beforeSomething', {
            detail: {
                prop1: true,
                prop2: false,
            }
        }));
    }
    f2(c) {}
}

const classStr = A.toString();
const getRe = type => `\\/\\/\\s*azDoc\\:${type}\\:start([\\s\\S]*?)\\/\\/\\s*azDoc\\:${type}\\:end`;

const parseMethods = str => {
    const re = new RegExp(getRe('method'), "g");
    let match = re.exec(str);
    while (match !== null) {
        console.log(match[1]);
        match = re.exec(str);
    }
};

const parseSettings = str => {
    const re = new RegExp(getRe('settings'), "g");
    let match = re.exec(str);
    while (match !== null) {
        console.log(match[1]);
        match = re.exec(str);
    }
};

const parseEvents = str => {
    const re = new RegExp(getRe('event'), "g");
    let match = re.exec(str);
    while (match !== null) {
        console.log(match[1]);
        match = re.exec(str);
    }
};

parseSettings(classStr);
parseMethods(classStr);
parseEvents(classStr);