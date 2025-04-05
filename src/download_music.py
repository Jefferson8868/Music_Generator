import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import requests
import os


download_dir = "./music_files"
os.makedirs(download_dir, exist_ok=True)

options = webdriver.ChromeOptions()
# options.add_argument("--headless")  # 无界面运行
# 初始化 Selenium WebDriver（无头模式）无options = webdriver.ChromeOptions()头options.add_argument("--headless")  模式无界面运行
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
# 基础 URL
base_url = "https://www.tukuppt.com/peiyueso/zhongguofengbeijingyinle"

# 基础 URL
base_url = "https://www.tukuppt.com/peiyueso/zhongguofengbeijingyinle"

# 下载文件
def download_file(url, save_path):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, stream=True, timeout=10)
        response.raise_for_status()
        with open(save_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"下载完成: {save_path}")
    except requests.RequestException as e:
        print(f"下载失败 {url}: {e}")

# 爬取单页
def crawl_page(url):
    driver.get(url)
    
    # 等待页面加载
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "cbox.audio-box"))
        )
    except Exception as e:
        print(f"页面加载失败: {e}")
        return

    # 解析页面
    soup = BeautifulSoup(driver.page_source, "html.parser")
    music_items = soup.find_all("dl", class_="cbox audio-box")

    for item in music_items:
        try:
            # 获取标题
            title = item.find("a", class_="title").text.strip()
            if not title:
                title = f"music_{item['data-id']}"  # 如果标题为空，使用 data-id

            # 找到播放按钮并点击
            play_button = driver.find_element(By.XPATH, f"//dl[@data-id='{item['data-id']}']//i[@class='icon-bofang']")
            play_button.click()

            # 等待 source 标签的 src 属性加载
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, f"//dl[@data-id='{item['data-id']}']//source[@src]"))
            )

            # 重新解析页面以获取更新后的 source 标签
            soup = BeautifulSoup(driver.page_source, "html.parser")
            source_tag = soup.find("dl", {"data-id": item["data-id"]}).find("source", class_="showsrc")
            mp3_url = source_tag["src"]
            print("mp3_url:" + mp3_url)
            if not mp3_url.startswith("http"):
                mp3_url = "https:" + mp3_url  # 补全 URL

            # 下载文件
            save_path = os.path.join(download_dir, f"{title}.mp3")
            download_file(mp3_url, save_path)
            time.sleep(1)  # 避免请求过快

        except Exception as e:
            print(f"处理条目 {title} 时出错: {e}")
            continue

# 主爬虫函数：爬取 10 页
def crawl_music_pages():
    for page in range(15, 51):  # 爬取 1 到 10 页
        if page == 1:
            url = f"{base_url}.html"
        else:
            url = f"{base_url}/__zonghe_0_0_0_0_0_0_{page}.html"
        
        print(f"正在爬取第 {page} 页: {url}")
        crawl_page(url)
        time.sleep(2)  # 每页之间稍作延迟，避免触发反爬

    driver.quit()
    print("爬取完成！")

# 运行爬虫
crawl_music_pages()