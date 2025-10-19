import pygame
import sys
import random

# 初始化 Pygame
pygame.init()

# 螢幕設定
screen_width = 800
screen_height = 700
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("俄羅斯方塊")

# 遊戲設定
BLOCK_SIZE = 30
GRID_WIDTH = 10
GRID_HEIGHT = 20
FONT_PATH = "assets/wqy-zenhei.ttc" # 字型路徑

# 遊戲區域位置
top_left_x = (screen_width - (GRID_WIDTH * BLOCK_SIZE)) // 2
top_left_y = 120 # 調整遊戲區域起始Y座標，留出上方空間顯示分數

# 遊戲區域 (Surface)
game_area = pygame.Surface((GRID_WIDTH * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE))

def draw_grid(surface):
    """繪製遊戲區域的網格"""
    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            rect = pygame.Rect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
            pygame.draw.rect(surface, (50, 50, 50), rect, 1)

# 方塊形狀 (俄羅斯方塊)
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[0, 1, 0], [1, 1, 1]],  # T
    [[0, 1, 1], [1, 1, 0]],  # S
    [[1, 1, 0], [0, 1, 1]],  # Z
    [[1, 0, 0], [1, 1, 1]],  # J
    [[0, 0, 1], [1, 1, 1]]   # L
]

# 方塊顏色
COLORS = [
    (0, 255, 255),  # I (Cyan)
    (255, 255, 0),  # O (Yellow)
    (128, 0, 128),  # T (Purple)
    (0, 255, 0),    # S (Green)
    (255, 0, 0),    # Z (Red)
    (0, 0, 255),    # J (Blue)
    (255, 165, 0)   # L (Orange)
]

class Block:
    def __init__(self, x, y, shape_index):
        self.x = x
        self.y = y
        self.shape_index = shape_index
        self.shape = SHAPES[self.shape_index]
        self.color = COLORS[self.shape_index]

    def rotate(self):
        """旋轉方塊"""
        # 儲存舊的形狀，以便旋轉無效時可以還原
        old_shape = self.shape
        # 旋轉演算法：先轉置，再反轉每一行
        self.shape = [list(row) for row in zip(*self.shape[::-1])]
        # 檢查旋轉後的位置是否合法
        if not is_valid_position(self, grid):
            self.shape = old_shape # 不合法，轉回去

def new_block():
    """隨機產生一個新的方塊"""
    shape_index = random.randint(0, len(SHAPES) - 1)
    # 將方塊生成在頂部中央
    start_x = GRID_WIDTH // 2 - len(SHAPES[shape_index][0]) // 2
    return Block(start_x, 0, shape_index)

def draw_block(surface, block):
    """繪製單個方塊"""
    for r, row in enumerate(block.shape):
        for c, cell in enumerate(row):
            if cell == 1:
                rect = pygame.Rect((block.x + c) * BLOCK_SIZE, (block.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
                pygame.draw.rect(surface, block.color, rect)

def is_valid_position(block, grid):
    """檢查位置是否合法"""
    for r, row in enumerate(block.shape):
        for c, cell in enumerate(row):
            if cell == 1:
                pos_x = block.x + c
                pos_y = block.y + r
                if not (0 <= pos_x < GRID_WIDTH and pos_y < GRID_HEIGHT):
                    return False
                if grid[pos_y][pos_x] != (0, 0, 0):
                    return False
    return True

def lock_block(block, grid):
    """鎖定方塊並更新網格"""
    for r, row in enumerate(block.shape):
        for c, cell in enumerate(row):
            if cell == 1:
                grid[block.y + r][block.x + c] = block.color

def clear_rows(grid):
    """檢查並清除已滿的行"""
    # 需要清除的行的索引
    full_rows = []
    for y, row in enumerate(grid):
        # 如果一行中沒有(0,0,0)的格子，表示該行已滿
        if all(color != (0, 0, 0) for color in row):
            full_rows.append(y)

    # 如果有滿行
    if full_rows:
        # 從下往上清除，避免索引錯亂
        for y in sorted(full_rows, reverse=True):
            # 刪除該行
            del grid[y]
            # 在頂部插入新的空白行
            grid.insert(0, [(0,0,0) for _ in range(GRID_WIDTH)])
        
        return len(full_rows)
    return 0

def draw_grid_blocks(surface, grid):
    """繪製網格中已鎖定的方塊"""
    for y, row in enumerate(grid):
        for x, color in enumerate(row):
            if color != (0,0,0):
                rect = pygame.Rect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
                pygame.draw.rect(surface, color, rect)

def draw_text(surface, text, size, x, y, color=(255,255,255)):
    """在指定位置繪製文字"""
    font = pygame.font.Font(FONT_PATH, size)
    text_surface = font.render(text, True, color)
    text_rect = text_surface.get_rect(center=(x, y))
    surface.blit(text_surface, text_rect)

# --- 遊戲變數 ---
grid = [[(0,0,0) for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
current_block = new_block()
score = 0
game_over = False

# 時間控制
clock = pygame.time.Clock()
fall_time = 0
fall_speed = 500  # 毫秒

# 遊戲主迴圈
while True:
    # 控制幀率
    dt = clock.tick(60)

    # --- 事件處理 ---
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        if event.type == pygame.KEYDOWN:
            if not game_over:
                if event.key == pygame.K_LEFT:
                    current_block.x -= 1
                    if not is_valid_position(current_block, grid):
                        current_block.x += 1
                if event.key == pygame.K_RIGHT:
                    current_block.x += 1
                    if not is_valid_position(current_block, grid):
                        current_block.x -= 1
                if event.key == pygame.K_DOWN:
                    current_block.y += 1
                    if not is_valid_position(current_block, grid):
                        current_block.y -= 1
                    else:
                        fall_time = 0
                if event.key == pygame.K_UP:
                    current_block.rotate()

    # --- 遊戲邏輯 ---
    if not game_over:
        # 自動下墜
        fall_time += dt
        if fall_time > fall_speed:
            fall_time = 0
            current_block.y += 1
            if not is_valid_position(current_block, grid):
                current_block.y -= 1
                lock_block(current_block, grid)
                
                # 清除已滿的行並計分
                lines_cleared = clear_rows(grid)
                if lines_cleared == 1:
                    score += 100
                elif lines_cleared == 2:
                    score += 300
                elif lines_cleared == 3:
                    score += 500
                elif lines_cleared >= 4:
                    score += 800
                
                current_block = new_block()
                
                # 檢查遊戲是否結束
                if not is_valid_position(current_block, grid):
                    game_over = True

    # --- 繪圖 ---
    screen.fill((0, 0, 0))
    
    # 繪製標題和分數
    draw_text(screen, "俄羅斯方塊", 64, screen_width / 2, 30)
    draw_text(screen, f"分數: {score}", 36, screen_width / 2, 80)

    # 繪製遊戲區域
    game_area.fill((20, 20, 20))
    draw_grid(game_area)
    draw_grid_blocks(game_area, grid)
    if not game_over:
        draw_block(game_area, current_block)
    
    screen.blit(game_area, (top_left_x, top_left_y))

    # 遊戲結束畫面
    if game_over:
        draw_text(screen, "遊戲結束", 80, screen_width / 2, screen_height / 2 - 50)
        draw_text(screen, f"最終分數: {score}", 50, screen_width / 2, screen_height / 2 + 20)

    # 更新螢幕
    pygame.display.flip()
