class Battle extends Phaser.Scene{
    constructor(){
        super("battleScene");
    }

    preload(){
        this.load.image('bear', './assets/images/bear.png');
        this.load.image('pig', './assets/images/piggy.png');
        this.load.image('monkey', './assets/images/monkey.png');
        this.load.image('player', './assets/images/sprite.png');
        this.load.image('background', './assets/images/minigameBackground.png');

        this.load.audio('click', './assets/sounds/click.mp3');
        this.load.audio('bearRoar', './assets/sounds/bearRoar.mp3');
        this.load.audio('Slap', './assets/sounds/slap.mp3');
        this.load.audio('Scream', './assets/sounds/scream.mp3');
        this.load.audio('Cartwheel', './assets/sounds/cartwheel.mp3');
    }

    create(){
        // Sets placehold background
        this.background = this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'background').setOrigin(0,0);
        
        // Creates Player
        this.player = new Player(this, 750, 500, 'player', 1);
        this.add.existing(this.player);
        this.player.createAttacks();
        this.player.createItems();
        console.log(this.player.items);
        this.player.flipX = true;

        // Displays player
        this.playerHp = this.add.text(760, 330, "", { color: '#ffffff', align: 'left', fontSize: 25}).setOrigin(0.5);
        this.playerHp.setText("HP: " + this.player.hp);

        // Creates Animal
        this.animal = null;
        if(DAY == 2 || DAY == 8){
            this.animal = new Bear(this, 125, 150, 'bear', 1, 'str');
        } else if(DAY == 4 || DAY == 10){
            this.animal = new Pig(this, 125, 150, 'pig', 1, 'wit');
        } else if(DAY == 6 || DAY == 12){
            this.animal = new Monkey(this, 125, 150, 'monkey', 1, 'dex');
        }
        this.add.existing(this.animal);

        // Displays animal health
        this.animalHp = this.add.text(125, 300, "", { color: '#ffffff', align: 'left', fontSize: 25}).setOrigin(0.5);
        this.animalHp.setText("HP: " + this.animal.hp);

        

        // Keeps track of whose turn it is
        this.turnCounter = 0;
        if(DAY % 7 == 0){
            REWARD = 15;
        }

        
        // container to hold the menus
        this.menus = this.add.container();
        this.actionsMenu = new ActionsMenu(this, 575, 725);
        this.attacksMenu = new AttacksMenu(this, 8, 725);

        // select current menu
        this.currentMenu = this.actionsMenu;

        // add menu to container
        this.menus.add(this.actionsMenu);
        this.menus.add(this.attacksMenu);

        // Grabs the attack arrays from BattleScene
        this.attacks = [];
        for(let i = 0; i < this.player.attacks.length; i += 2){
            this.attacks.push(this.player.attacks[i]);
        }
        this.items = this.player.items;

        // Flag for attacksMenu to determine whether to emit attack or item
        this.selectedItems = false;

        // Event listener for keystrokes
        this.input.keyboard.on('keydown', this.onKeyInput, this);

        // Event listener for player's turn
        this.events.on('PlayerTurn', this.onPlayerTurn, this);

        // Listerner for actionsMenu Confirm()
        this.events.on('SelectAttacks', this.showAttacks, this);

        this.events.on('SelectItems', this.showItems, this);

        this.events.on('attack', this.attackEnemy, this);

        this.events.on('item', this.useItem, this);

        this.sys.events.once('shutdown', this.shutdown, this);

        this.message = new Message(this, this.events);
                this.add.existing(this.message);

        this.nextTurn();

        
        

        
    }

    // Moves the battle along
    nextTurn(){
        this.turnCounter++;
        if(this.animal.isLiving && this.player.isLiving){
            if(this.turnCounter % 2 != 0){
                this.events.emit('PlayerTurn');
            } else{
                this.animal.attack(this.player);
                this.playerHp.setText("HP: " + this.player.hp);
                this.sound.add('bearRoar').play();
                this.time.addEvent({ delay: 3500, callback: this.nextTurn, callbackScope: this });
            }  
        } else {
            if(this.animal.isLiving == true){
                this.events.emit("Message", "You've been defeated...");
                let timer = setTimeout(() =>{
                    this.exitBattle();
                }, 3500);
            } else{
                this.events.emit("Message", "You won! You find yourself rewarded with " + REWARD + " dollars!");
                MONEY += REWARD;
                let timer = setTimeout(() =>{
                    this.exitBattle();
                }, 3500);
            }
        }
    }

    // Function that calls on keystrokes
    onKeyInput(event){
        if(this.currentMenu){
            if(event.code == "ArrowUp"){
                this.sound.add('click').play();
                this.currentMenu.moveSelectionUp();
            } else if(event.code === "ArrowDown") {
                this.sound.add('click').play();
                this.currentMenu.moveSelectionDown();
            } else if(event.code === "ArrowRight" || event.code === "Shift") {
 
            } else if(event.code === "Space" || event.code === "ArrowLeft") {
                this.currentMenu.confirm();
            }
        }   
    }

    // Function that calls on Player's turn.
    onPlayerTurn(){
        this.currentMenu = this.actionsMenu;
        this.actionsMenu.select();
    }

    // Function that calls when Player selects a type of attack they want to use.
    showAttacks(){
        this.selectedItems = false;
        this.attacksMenu.remap(this.attacks);

        this.currentMenu = this.attacksMenu;
        this.attacksMenu.select();
    }

    attackEnemy(){
        let index = this.attacksMenu.menuItemIndex;
        this.actionsMenu.deselect();
        this.attacksMenu.deselect();
        this.attacksMenu.clear();

        this.currentMenu = null;
        this.receivePlayerSelection('attack', index);
    }

    // Displays the items player has
    showItems(){
        this.selectedItems = true;          // Set items flag to true

        // If player has no item, display message and return player to action menu
        if(BOUGHTPOTION == false || this.items.length < 1){
            this.events.emit("Message", "You do not have any items to use...");
            let timer = setTimeout(() =>{
                this.currentMenu = this.actionsMenu;
                this.actionsMenu.select();
            }, 3500);
            return;
        }

        this.attacksMenu.remap(this.items);
        this.currentMenu = this.itemsMenu;
        this.attacksMenu.select();
    }

    useItem(){
        let index = this.itemsMenu.menuItemIndex;
        this.actionsMenu.deselect();
        this.attacksMenu.deselect();
        this.attacksMenu.clear();

        this.currentMenu = null;
        this.receivePlayerSelection('item', index);
    }


    shutdown(){
        console.log('ui shutdown');
        this.input.keyboard.off('keydown');

        // Event listener for player's turn
        this.events.off('PlayerTurn');

        // Listerner for actionsMenu Confirm()
        this.events.off('SelectAttacks');

        this.events.off('SelectItems');

        this.events.off('attack');

        this.events.off('item');
        this.message.destroy();
    }


    // recieves player selection and calls nextTurn()
    receivePlayerSelection(action, index){
        if(action == 'attack'){
            if(index == 0){
                let type = "str";
                for(let i = 0; i < this.player.attackText.length; i += 6){
                    if(this.player.attacks[index] === this.player.attackText[i]){
                        let damage = this.player.attacks[index + 1];
                        if(this.player.attacks[index] === 'Slap'){
                            this.sound.add('Slap').play();
                        }
                        this.player.attack(this.animal, type, damage, i);
                    }
                }
            } else if(index == 1){
                let type = "wit";
                for(let i = 2; i < this.player.attackText.length; i += 6){
                    if(this.player.attacks[index + 1] === this.player.attackText[i]){
                        let damage = this.player.attacks[index + 2];
                        if(this.player.attacks[index + 1] === 'Scream'){
                            this.sound.add('Scream').play();
                        }
                        this.player.attack(this.animal, type, damage, i);
                    }
                }
            } else{
                let type = "dex";
                for(let i = 4; i < this.player.attackText.length; i += 6){
                    if(this.player.attacks[index + 2] === this.player.attackText[i]){
                        let damage = this.player.attacks[index + 3];
                        if(this.player.attacks[index + 2] === 'Cartwheel'){
                            this.sound.add('Cartwheel').play();
                        }
                        this.player.attack(this.animal, type, damage, i);
                    }
                }

            }
            this.animalHp.setText("HP: " + this.animal.hp);
            this.time.addEvent({ delay: 3500, callback: this.nextTurn, callbackScope: this });
        } else if(action == 'item'){
            if(this.player.items[index] == 'Potion'){
                this.events.emit("Message", "SLURRRP. You drink greedily from the potion you just pulled out of your pocket.");
                this.player.hp += 20;
                if(this.player.hp > (2 * (END - 1) + 14)){
                    this.player.hp = 2 * (END - 1) + 14;
                }
                this.playerHp.setText("HP: " + this.player.hp);
                this.player.items.splice(index, 1);
            }
            this.time.addEvent({ delay: 3500, callback: this.nextTurn, callbackScope: this });
        }
    }

    /*
    // Checks if battle is over by checking animal and player is living or not
    checkEndBattle(){
        let victory = true;
        if(this.animal.living == true){
            victory = false;
        }
        let loseBattle = false;
        if(this.player.living == false){
            loseBattle = true;
        }
        return victory || loseBattle;
    }
    */
    

    exitBattle(){
        this.scene.start('cityScene');
    }
}

