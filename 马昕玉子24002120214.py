# -*- coding: utf-8 -*-
"""
实验1 数据爬取
目标站点：http://books.toscrape.com
采集字段：书名、价格、星级、详情链接
输出文件：books_1000.csv
"""

# 1.导入所需模块
import requests
from bs4 import BeautifulSoup
import time
import csv

# ================= 爬虫全局配置=================
BASE_URL = "http://books.toscrape.com/catalogue/page-{}.html"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
SAVE_CSV_NAME = "books_1000.csv"
TARGET_DATA_NUM = 250  # 设置目标抓取数据条数,≥200
REQUEST_DELAY = 1      # 每次请求间隔1 秒,爬虫礼仪

print("模块导入成功")
print(f"目标抓取数量:{TARGET_DATA_NUM}")
print(f"请求延时:{REQUEST_DELAY} s")


def parse_single_page(html_text):
    """
    解析单页HTML,提取所有图书信息
    :param html_text: 网页源代码字符串
    :return: 图书字典列表
    """
    soup = BeautifulSoup(html_text, "html.parser")
    book_item_list = soup.find_all("article", class_="product_pod")
    page_book_data = []
    for item in book_item_list:
        book_title = item.h3.a["title"]
        price_text = item.find("p", class_="price_color").get_text(strip=True)
        star_class = item.find("p")["class"]
        star_level = star_class[1]
        relative_link = item.h3.a["href"]
        detail_url = "http://books.toscrape.com/catalogue/" + relative_link
        book_info = {
            "书名": book_title,
            "价格": price_text,
            "星级": star_level,
            "详情链接": detail_url
        }
        page_book_data.append(book_info)
    return page_book_data


def run_crawl(target_count):
    """
    主爬虫循环：翻页采集数据，异常捕获
    :param target_count: 需要抓取的目标条数
    :return: 抓取完成的图书数据列表
    """
    all_crawl_data = []
    current_page = 1
    while len(all_crawl_data) < target_count:
        page_url = BASE_URL.format(current_page)
        print(f"\n 正在请求第{current_page} 页: {page_url}")
        try:
            response = requests.get(page_url, headers=HEADERS, timeout=10)
            response.raise_for_status()
            current_page_data = parse_single_page(response.text)
            if len(current_page_data) == 0:
                print("到达最后一页,无更多数据")
                break
            all_crawl_data.extend(current_page_data)
            print(f"第{current_page}页完成,累计{len(all_crawl_data)} 条")
            current_page += 1
            time.sleep(REQUEST_DELAY)
        except Exception as error:
            print(f"第{current_page}页异常:{str(error)}")
            current_page += 1
            time.sleep(REQUEST_DELAY)
    final_data = all_crawl_data[:target_count]
    print(f"采集结束,共获取{len(final_data)} 条数据")
    return final_data


def save_to_csv(data_list, filename):
    """
    将字典列表保存为csv文件，utf‑8编码
    :param data_list: 数据列表
    :param filename: 保存文件名
    """
    if len(data_list) == 0:
        print("列表为空,不执行保存")
        return
    header = data_list[0].keys()
    with open(filename, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(data_list)
    print(f" 文件成功保存:{filename}")


if __name__ == "__main__":
    # 正式执行采集
    print("开始正式采集任务,目标:{}条".format(TARGET_DATA_NUM))
    crawl_result = run_crawl(target_count=TARGET_DATA_NUM)

    # 结果预览，打印前5条
    print("\n 全部数据预览(前5 条):")
    for idx, book in enumerate(crawl_result[:5]):
        print(f"{idx}. {book}")

    if len(crawl_result) >= 1:
        print(f"\n 正式抓取完成,总共{len(crawl_result)} 条")
    else:
        print("未获取到任何数据,请排查网络或代码")

    # 保存csv文件
    print("\n---------- 保存本次爬虫正式数据----------")
    save_to_csv(crawl_result, SAVE_CSV_NAME)

    # 简单统计拓展：统计各星级图书数量
    star_stat = {}
    for book in crawl_result:
        s = book["星级"]
        star_stat[s] = star_stat.get(s, 0) + 1
    print("\n星级统计结果:")
    print(star_stat)
