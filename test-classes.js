// Test classe ES5 vs ES6
console.log('🧪 Test compatibilità classi...');

// Versione ES5 (compatibile)
function TestClassES5() {
    this.name = 'TestES5';
}
TestClassES5.prototype.getName = function() {
    return this.name;
};

// Versione ES6 (moderna)
class TestClassES6 {
    constructor() {
        this.name = 'TestES6';
    }
    getName() {
        return this.name;
    }
}

window.TestClassES5 = TestClassES5;
window.TestClassES6 = TestClassES6;

console.log('✅ Classi definite');
