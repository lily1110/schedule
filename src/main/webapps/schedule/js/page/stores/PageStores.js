var DingDongDispatcher = require('../../dispatcher/DingDongDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var current="";

var PageStores = assign({}, EventEmitter.prototype, {
    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function(callback) {
        this.page="";
        this.removeListener(CHANGE_EVENT, callback);
    },
    changpage:function(_page) {
        current = _page;
    },
    getPage: function() {
        return current;
    },

});


PageStores.dispatchToken = DingDongDispatcher.register(function(action) {
    switch(action.type) {
        case 'CHANGE_PAGE':
            PageStores.changpage(action.page);
            PageStores.emitChange();
            break;
        default:
            break;
    }
});

module.exports = PageStores;
