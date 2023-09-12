document.addEventListener('DOMContentLoaded', function () {
    const gameArea = document.getElementById('gameArea');
    const startButton = document.getElementById('startGame');
    const retryButton = document.getElementById('retryGame');

    let scrollSpeed = 2;  // 可以調整這個數值來控制背景滾動的速度
    let enemyScrollSpeed = 18;  // 控制怪物的滾動速度
    let boosterpackSpeed = 4;  // 我假設這裡是你原本的滾動速度，你可以提高此值以加快速度
    startButton.addEventListener('click', startGame);
    retryButton.addEventListener('click', retryGame);
    let backgroundScrollInterval; // 用來存儲背景滾動的 setInterval
    let obstacleMoveInterval; // 用來存儲障礙物移動的 setInterval

    // 定義兩個新的變量來存儲setInterval的引用
    let generateObstacleInterval;
    let generateEnemyInterval;
    let enemyMoveInterval; // 用來存儲怪物移動的 setInterval
    const enemies = []; // 儲存當前的怪物
    const startTime = new Date().getTime();  // 紀錄遊戲開始的時間

    function startGame() {
        startButton.style.display = 'none';
        const bg1 = document.createElement('img');
        const bg2 = document.createElement('img');
        bg1.src = './asset/bg/forest4.png';
        bg2.src = './asset/bg/forest4.png';
        bg1.style.position = 'absolute';
        bg2.style.position = 'absolute';
        bg1.style.top = '0';
        bg1.style.left = '0';
        bg2.style.top = '0';
        bg2.style.left = '945px'; // 初始化位置為右邊
        gameArea.appendChild(bg1);
        gameArea.appendChild(bg2);

        clearInterval(backgroundScrollInterval);
        backgroundScrollInterval = setInterval(function () {
            const newLeft1 = parseInt(bg1.style.left) - scrollSpeed;
            const newLeft2 = parseInt(bg2.style.left) - scrollSpeed;
            bg1.style.left = `${newLeft1}px`;
            bg2.style.left = `${newLeft2}px`;

            // 重置背景位置，保持滾動連續
            if (newLeft1 <= -945) {
                bg1.style.left = `${newLeft2 + 945}px`;  // 945 * 2
            }
            if (newLeft2 <= -945) {
                bg2.style.left = `${newLeft1 + 945}px`;  // 945 * 2
            }
        }, 16);

        const playerImage = document.createElement('img');
        playerImage.src = './asset/player/player1.png';
        playerImage.style.position = 'absolute';
        playerImage.style.bottom = '40px';
        playerImage.style.left = '10px';
        gameArea.appendChild(playerImage);
        let jumpHeight = 0;
        const jumpSpeed = 4;
        let jumpAnimation;
        let fallAnimation;
        let runningAnimation;
        let isColliding = false; // 新增這行
        let playerAnimationFrame = 1;

        function startRunningAnimation() {
            clearInterval(runningAnimation);  // 確保停止任何現有的跑步動畫
            runningAnimation = setInterval(function () {
                playerAnimationFrame++;
                if (playerAnimationFrame > 3) {
                    playerAnimationFrame = 1;
                }
                playerImage.src = `./asset/player/player${playerAnimationFrame}.png`;
            }, 150);
        }

        startRunningAnimation();
        const bubbles = []; // 儲存當前的泡泡
        let isAttacking = false;

        document.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowUp' && !isColliding) {
                clearInterval(runningAnimation); // 停止跑步動畫
                clearInterval(jumpAnimation); // 停止之前的跳躍動畫
                clearInterval(fallAnimation); // 停止之前的下落動畫
                playerImage.src = `./asset/player/player_jump1.png`;
                jumpHeight = 100; // 固定跳躍高度為100px
                let jumpFrame = 1;
                let jumpFrameChangeDelay = 0; // 用來控制跳躍動畫帧的變換速度

                jumpAnimation = setInterval(function () {
                    playerImage.style.bottom = `${parseInt(playerImage.style.bottom) + jumpSpeed}px`;
                    jumpHeight -= jumpSpeed;
                    jumpFrameChangeDelay++;

                    if (jumpHeight <= 70 && jumpFrame === 1) { // 每過80毫秒(16*5)更換一次跳躍動畫幀
                        jumpFrame++;
                        playerImage.src = `./asset/player/player_jump${jumpFrame}.png`;
                    }

                    if (jumpHeight <= 0) { // 當跳躍高度用完時
                        clearInterval(jumpAnimation);

                        // 開始下降
                        fallAnimation = setInterval(function () {
                            playerImage.style.bottom = `${parseInt(playerImage.style.bottom) - jumpSpeed}px`;
                            if (parseInt(playerImage.style.bottom) <= 70) {
                                playerImage.src = `./asset/player/player_jump3.png`; // 下落時的動畫幀
                            }

                            if (parseInt(playerImage.style.bottom) <= 40) { // 當回到地面時
                                playerImage.style.bottom = '40px';
                                clearInterval(fallAnimation);
                                startRunningAnimation();
                            }
                        }, 16);
                    }
                }, 16);
            }

            if (e.key === ' ' && !isAttacking && !isColliding) {
                // 創建泡泡
                const bubbleImage = document.createElement('img');
                bubbleImage.src = './asset/bubble.png';
                bubbleImage.style.position = 'absolute';
                const playerHeight = playerImage.getBoundingClientRect().height;
                bubbleImage.style.bottom = `${parseInt(playerImage.style.bottom) + 25}px`;
                bubbleImage.style.left = `${parseInt(playerImage.style.left) + 50}px`; // 基於玩家位置
                gameArea.appendChild(bubbleImage);
                bubbles.push(bubbleImage);
                isAttacking = true;
                clearInterval(runningAnimation);
                attackAnimationFrame = 1;
                playerImage.src = `./asset/player/player_attack${attackAnimationFrame}.png`;

                attackAnimation = setInterval(function () {
                    attackAnimationFrame++;
                    if (attackAnimationFrame > 3) {
                        attackAnimationFrame = 1;
                        clearInterval(attackAnimation);
                        isAttacking = false;
                        startRunningAnimation();
                        return;
                    }
                    playerImage.src = `./asset/player/player_attack${attackAnimationFrame}.png`;
                }, 150);
            }

            if (e.key === ' ' && !isAttacking && !isColliding) {
                isAttacking = true;
                clearInterval(runningAnimation);
                attackAnimationFrame = 1;
                playerImage.src = `./asset/player/player_attack${attackAnimationFrame}.png`;

                attackAnimation = setInterval(function () {
                    attackAnimationFrame++;
                    if (attackAnimationFrame > 3) {
                        attackAnimationFrame = 1;
                        clearInterval(attackAnimation);
                        isAttacking = false;
                        startRunningAnimation();
                        return;
                    }
                    playerImage.src = `./asset/player/player_attack${attackAnimationFrame}.png`;
                }, 150);
            }
        });

        document.addEventListener('keyup', function (e) {
            if (e.key === ' ' && isAttacking) {
                isAttacking = false;
                clearInterval(attackAnimation);
                startRunningAnimation();
            }
        });

        setInterval(function () {
            bubbles.forEach((bubble, index) => {
                bubble.style.left = `${parseInt(bubble.style.left) + 5}px`; // 泡泡向前移動的速度

                if (parseInt(bubble.style.left) > 1000) { // 當泡泡超出遊戲視窗
                    gameArea.removeChild(bubble);
                    bubbles.splice(index, 1);
                }

                // 泡泡和敵人的碰撞偵測
                enemies.forEach((enemy, enemyIndex) => {
                    const bubbleRect = bubble.getBoundingClientRect();
                    const enemyRect = enemy.getBoundingClientRect();

                    if (bubbleRect.left < enemyRect.right &&
                        bubbleRect.right > enemyRect.left &&
                        bubbleRect.top < enemyRect.bottom &&
                        bubbleRect.bottom > enemyRect.top) {
                        enemy.src = './asset/obstacle/devil/hurt/enemy_hurt.gif'; // 更改敵人圖片為受傷狀態

                        setTimeout(() => { // 1秒后移除敵人
                            gameArea.removeChild(enemy);
                            enemies.splice(enemyIndex, 1);
                        }, 1000);

                        // 移除泡泡
                        gameArea.removeChild(bubble);
                        bubbles.splice(index, 1);
                    }
                });

                // 泡泡和補充包的碰撞偵測
                powerUps.forEach((powerUp, powerUpIndex) => {
                    const bubbleRect = bubble.getBoundingClientRect();
                    const powerUpRect = powerUp.getBoundingClientRect();

                    if (bubbleRect.left < powerUpRect.right &&
                        bubbleRect.right > powerUpRect.left &&
                        bubbleRect.top < powerUpRect.bottom &&
                        bubbleRect.bottom > powerUpRect.top) {
                        // 移除補充包
                        gameArea.removeChild(powerUp);
                        powerUps.splice(powerUpIndex, 1);

                        // 移除泡泡
                        gameArea.removeChild(bubble);
                        bubbles.splice(index, 1);
                    }
                });
            });
        }, 16);

        const obstacles = []; // 存儲當前的障礙物
        const BUFFER = 10 // 增加或減少此值以調整與障礙物的碰撞緩衝區大小
        const MBUFFER = 70; // 增加或減少此值以調整與怪物的碰撞緩衝區大小
        let runningAnimationTimeout;

        function generateObstacle() {
            const obstacleImage = document.createElement('img');
            obstacleImage.src = './asset/obstacle/rock2.png';
            obstacleImage.style.position = 'absolute';
            obstacleImage.style.bottom = '42px';
            obstacleImage.style.left = '945px'; // 從右側開始
            gameArea.appendChild(obstacleImage);
            obstacles.push(obstacleImage);
            obstacleImage.isHit = false;

            // 隨機調整生成障礙物的間隔時間
            const randomObstacleTime = 6000 + Math.random() * 4000;  // 6秒到10秒之間
            clearInterval(generateObstacleInterval);
            generateObstacleInterval = setInterval(generateObstacle, randomObstacleTime);
        }

        clearInterval(generateObstacleInterval);  // 清除現有的生成障礙物的 setInterval
        generateObstacleInterval = setInterval(generateObstacle, 8000);  // 初始每8秒生成新的障礙物

        clearInterval(obstacleMoveInterval);
        obstacleMoveInterval = setInterval(function () {
            obstacles.forEach((obstacle, index) => {
                obstacle.style.left = `${parseInt(obstacle.style.left) - scrollSpeed}px`;

                // 當障礙物移出畫面，將其從DOM和數組中移除
                if (parseInt(obstacle.style.left) < -50) {
                    gameArea.removeChild(obstacle);
                    obstacles.splice(index, 1);
                    obstacle.isHit = false;  // 重置
                }
                // 障礙物碰撞檢測
                const playerRect = playerImage.getBoundingClientRect();
                const obstacleRect = obstacle.getBoundingClientRect();

                if (!obstacle.isHit &&
                    playerRect.left + BUFFER < obstacleRect.right &&
                    playerRect.right - BUFFER > obstacleRect.left &&
                    playerRect.top + BUFFER < obstacleRect.bottom &&
                    playerRect.bottom - BUFFER > obstacleRect.top) {
                    isColliding = true;
                    playerImage.src = './asset/obstacle/chi_jump3.png';
                    clearInterval(runningAnimation);
                    clearTimeout(runningAnimationTimeout);
                    hideHeart(); // 隱藏一顆愛心
                    obstacle.isHit = true; // 標記該障礙物已被撞擊
                    runningAnimationTimeout = setTimeout(() => {
                        isColliding = false;
                        if (!isColliding) {
                            startRunningAnimation();
                        }
                    }, 220);
                }
            });
        }, 16);

        function generateEnemy() {
            const currentTime = new Date().getTime();
            const elapsedTime = (currentTime - startTime) / 1000;  // 當遊戲運行時間，單位：秒
            const enemyImage = document.createElement('img');
            enemyImage.src = './asset/obstacle/devil/walk/enemy_walk.gif';
            enemyImage.style.position = 'absolute';
            enemyImage.style.top = `${Math.random() * (200 - 170 - 60) + 60}px`; // 在60px到200px之間
            enemyImage.style.left = '945px';
            gameArea.appendChild(enemyImage);
            enemies.push(enemyImage);
            let randomEnemyTime;
            enemyImage.isHit = false;

            if (elapsedTime < 5) {
                randomEnemyTime = 8000;  // 8秒
            } else {
                randomEnemyTime = 7000 + Math.random() * 3000;  // 7秒到10秒之间
            }

            clearInterval(generateEnemyInterval);
            generateEnemyInterval = setInterval(generateEnemy, randomEnemyTime);
        }

        clearInterval(generateEnemyInterval);
        generateEnemyInterval = setInterval(generateEnemy, 10000);  // 初始每10秒生成新的怪物

        // 怪物動畫的邏輯
        clearInterval(enemyMoveInterval);
        enemyMoveInterval = setInterval(function () {
            enemies.forEach((enemy, index) => {
                enemy.style.left = `${parseInt(enemy.style.left) - enemyScrollSpeed}px`;
                // 當怪物移出畫面，將其從DOM和陣列中移除
                if (parseInt(enemy.style.left) < -100) {
                    gameArea.removeChild(enemy);
                    enemies.splice(index, 1);
                    enemy.isHit = false;  // 重置
                }
                // 怪物碰撞檢測
                const playerRect = playerImage.getBoundingClientRect();
                const enemyRect = enemy.getBoundingClientRect();

                if (!enemy.isHit &&
                    playerRect.left + MBUFFER < enemyRect.right &&
                    playerRect.right - MBUFFER > enemyRect.left &&
                    playerRect.top + MBUFFER < enemyRect.bottom &&
                    playerRect.bottom - MBUFFER > enemyRect.top) {
                    isColliding = true;
                    playerImage.src = './asset/obstacle/chi_jump3.png';
                    clearInterval(runningAnimation);
                    clearTimeout(runningAnimationTimeout);
                    hideHeart(); // 隱藏一顆愛心
                    enemy.isHit = true; // 標記該怪物已被撞擊
                    runningAnimationTimeout = setTimeout(() => {
                        isColliding = false;
                        if (!isColliding) {
                            startRunningAnimation();
                        }
                    }, 1000);
                }
            });
        }, 150); // 更新怪物的動畫

        function hideHeart() {
            const visibleHearts = document.querySelectorAll('.heart:not(.hidden)');
            if (visibleHearts.length > 0) {
                visibleHearts[visibleHearts.length - 1].classList.add('hidden');
            }

            if (visibleHearts.length === 1) { // 只剩下一顆愛心時
                gameOver();
            }
        }

        const powerUps = []; // 儲存當前的補充包
        let generatePowerUpInterval; // 儲存生成補充包的setInterval的引用

        function generatePowerUp() {
            const powerUpImage = document.createElement('img');
            powerUpImage.src = './asset/buff/PAIA.gif';
            powerUpImage.style.position = 'absolute';
            // 更改範圍從10px到400px之間，你可以根據需要調整這些數字
            powerUpImage.style.top = `${Math.random() * (200 - 96 - 30) + 30}px`;  //30~200px
            powerUpImage.style.left = '945px'; // 從右側開始
            gameArea.appendChild(powerUpImage);
            powerUps.push(powerUpImage);
            const randomPowerUpTime = 7000 + Math.random() * 6000;  // 7秒到13秒之間
            clearInterval(generatePowerUpInterval);
            generatePowerUpInterval = setInterval(generatePowerUp, randomPowerUpTime);
        }

        clearInterval(generatePowerUpInterval);
        generatePowerUpInterval = setInterval(generatePowerUp, 10000);  // 初始每10秒生成新的補充包

        setInterval(function () {
            powerUps.forEach((powerUp, index) => {
                powerUp.style.left = `${parseInt(powerUp.style.left) - boosterpackSpeed}px`;
                // 當補充包移出畫面，將其從DOM和陣列中移除
                if (parseInt(powerUp.style.left) < -50) {
                    gameArea.removeChild(powerUp);
                    powerUps.splice(index, 1);
                }
                // 碰撞檢測
                const playerRect = playerImage.getBoundingClientRect();
                const powerUpRect = powerUp.getBoundingClientRect();

                if (playerRect.left + BUFFER < powerUpRect.right &&
                    playerRect.right - BUFFER > powerUpRect.left &&
                    playerRect.top + BUFFER < powerUpRect.bottom &&
                    playerRect.bottom - BUFFER > powerUpRect.top) {

                    // 移除補充包
                    gameArea.removeChild(powerUp);
                    powerUps.splice(index, 1);
                }
            });
        }, 16);
    }

    function retryGame() {
        // 重新開始遊戲邏輯...
        // 清除所有 setInterval 和 setTimeout
        clearInterval(backgroundScrollInterval);
        clearInterval(obstacleMoveInterval);
        clearInterval(runningAnimation);
        clearTimeout(runningAnimationTimeout);
        clearInterval(enemyMoveInterval);
        // 清除生成元素的 setInterval
        clearInterval(generateObstacleInterval);
        clearInterval(generateEnemyInterval);
        clearInterval(generatePowerUpInterval);
    }

    function gameOver() {
        document.querySelector('.gameOver').classList.remove('hidden');
        // 停止所有的動畫和生成障礙物或怪物的計時器
        clearInterval(generateObstacleInterval);
        clearInterval(obstacleMoveInterval);
        clearInterval(generateEnemyInterval);
        clearInterval(enemyMoveInterval);
        clearInterval(runningAnimation);
        clearTimeout(runningAnimationTimeout);
    }
});