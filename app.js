// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome)*100);  
        } else {
            this.percentage = -1;
        }
              
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(x){
            sum += x.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0,
        percentage: -1
    };

    

    return {
        addItem: function(type,description,value) {
            var newItem, ID;

            // Create new ID.
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on inc or exp type.
            if (type === 'exp') {
                newItem = new Expense(ID,description,value)
            } else if (type === 'inc') {
                newItem = new Income(ID,description,value)
            }

            // Pushing the item to structure and returning it.
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type,id) {
            var ids, index;

            // IDs array
            ids = data.allItems[type].map(function(x) {
                return x.id;
            });

            // Index of the id
            index = ids.indexOf(id);

            // Removing if id exists in the array
            if (index !== -1) {
                data.allItems[type].splice(index,1);
            }
            
        },

        calculateBudget: function() {
            // Calculate Total Income and Expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // Calculate Budget => Income - Expenses
            data.budget = data.totals.inc - data.totals.exp;
            // Calculate Percentage of Expenses
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(x) {
                x.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(x){
                return x.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        test: function() {
            console.log(data);
        }

    };

})();

// UI CONTROLLER
var UIController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num,type) {
        var numSplit, int, dec, sign;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
        } if ( int.length > 6) {
            int = int.substr(0,1) + ',' + int.substr(1,6);
        }

        dec = numSplit[1];


        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;

    }

    var nodeListForEach = function(list,callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i],i);
        }
    };

    return {
        getInput: function() {
            return {
                 type: document.querySelector(DOMStrings.inputType).value, // inc or exp
                 description: document.querySelector(DOMStrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' 
            }
            
            // Replace placeholder with data
            newHtml = html.replace('%id%',obj.id).replace('%description%',obj.description[0].toUpperCase() + obj.description.slice(1)).replace('%value%',formatNumber(obj.value, type));

            // Insert HTML to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);  
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type) ;
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc'); 
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if (obj.percentage>0) { 
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(x,i) {
                if (percentages[i] > 0) {
                    x.textContent = percentages[i] + '%';
                } else {
                    x.textContent = '--';
                }
            });
        },

        displayDate: function() {

            var now, year, month;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ', ' + year;
        },

        changeType: function() {
            
           var element, html, type;
           
           element = DOMStrings.inputBtn;
           type = document.querySelector(DOMStrings.inputType).value;
           
           var fields = document.querySelectorAll(
            DOMStrings.inputType + ',' +
            DOMStrings.inputDescription + ',' +
            DOMStrings.inputValue);
           
           if (type === 'exp') {

                html = '<ion-icon name="remove-circle-outline"></ion-icon>'
                document.querySelector(element).innerHTML = html;

                nodeListForEach(fields, function(x) {
                    x.classList.toggle('red-focus');
                });
    
                document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            }  else if (type === 'inc') {

                html = '<ion-icon name="add-circle-outline"></ion-icon>'
                document.querySelector(element).innerHTML = html;

                nodeListForEach(fields, function(x) {
                    x.classList.toggle('blue-focus');
                });
                    
                document.querySelector(DOMStrings.inputBtn).classList.toggle('blue');
            }
        },

        getDOMStrings: function() {
            return DOMStrings;
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current) {
                current.value = "";
            })
            fieldsArr[0].focus();
        }
    }
})();

// APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

   var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMStrings();

        // ADD btn click 
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        // ENTER KEY PRESS
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.plusOrMinus);
   };

   var updateBudget = function() {


       // 1. Calculate budget
       budgetCtrl.calculateBudget(); 
       // 2. Return budget
       var budget = budgetCtrl.getBudget(); 
       // 3. Display the budget on UI
       UIController.displayBudget(budget); 
   };

   var updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from budget ctrl
        var percentages = budgetCtrl.getPercentages();
        // 3. Update UI w/new percentages
        UICtrl.displayPercentages(percentages);
   };

   var ctrlAddItem = function() {
        var input, newItem;
    
        // 1. Get input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            
            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            
            // 3. Add item to UI
            UICtrl.addListItem(newItem, input.type);
            
            // 4. Clear Fields
            UICtrl.clearFields();
            
            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Calculate and update percentages
            updatePercentages();
        }    
   }

   var ctrlDeleteItem = function(event) {
        var itemID, splitID,type,ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            // inc-0 / exp-0
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from data structure.
            budgetCtrl.deleteItem(type,ID);

            // 2.  Delete item from UI.
            UICtrl.deleteListItem(itemID);

            // 3. Update and display budget.
            updateBudget();
            
            // 4. Calculate and update percentages
            updatePercentages();

        }
   }
   
   return {
       init: function() {
            console.log('Application has started.');
            console.log('follow the white rabbit.');
            setupEventListeners();
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
       }
   };

})(budgetController, UIController);

controller.init();