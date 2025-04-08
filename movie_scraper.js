// 电影详情爬取脚本
function scrapeMovieDetail() {
    const movie = {
        // 基本信息
        title: document.querySelector('.dy_tit_big')?.textContent?.split('|')[0]?.trim() || '',
        year: document.querySelector('.dy_tit_big span')?.textContent?.trim() || '',
        cover: document.querySelector('.dyimg img')?.src || '',
        
        // 详细信息
        details: {
            type: Array.from(document.querySelectorAll('.moviedteail_list li')).find(li => li.textContent.includes('类型'))?.querySelector('a')?.textContent || '',
            region: Array.from(document.querySelectorAll('.moviedteail_list li')).find(li => li.textContent.includes('地区'))?.querySelector('a')?.textContent || '',
            year: Array.from(document.querySelectorAll('.moviedteail_list li')).find(li => li.textContent.includes('年份'))?.querySelector('a')?.textContent || '',
            alias: Array.from(document.querySelectorAll('.moviedteail_list li')).find(li => li.textContent.includes('又名'))?.querySelectorAll('a')?.map(a => a.textContent) || [],
            releaseDate: Array.from(document.querySelectorAll('.moviedteail_list li')).find(li => li.textContent.includes('上映'))?.querySelector('span')?.textContent || '',
            director: Array.from(document.querySelectorAll('.moviedteail_list li')).find(li => li.textContent.includes('导演'))?.querySelectorAll('span')?.map(span => span.textContent) || [],
            writer: Array.from(document.querySelectorAll('.moviedteail_list li')).find(li => li.textContent.includes('编剧'))?.querySelectorAll('span')?.map(span => span.textContent) || [],
            actors: Array.from(document.querySelectorAll('.moviedteail_list li')).find(li => li.textContent.includes('主演'))?.querySelectorAll('span')?.map(span => span.textContent) || [],
            language: Array.from(document.querySelectorAll('.moviedteail_list li')).find(li => li.textContent.includes('语言'))?.querySelector('span')?.textContent || ''
        },
        
        // 剧情简介
        description: document.querySelector('.yp_context')?.textContent?.trim() || '',
        
        // 播放列表
        playList: Array.from(document.querySelectorAll('.paly_list_btn a')).map(a => ({
            title: a.textContent,
            url: a.href
        }))
    };

    // 输出结果
    console.log('电影信息:', movie);
    
    return movie;
}

// 执行爬取
const movieData = scrapeMovieDetail();

// 保存到本地存储
function saveToLocalStorage(data) {
    localStorage.setItem('movieDetail', JSON.stringify(data));
}

// 保存数据
saveToLocalStorage(movieData);
