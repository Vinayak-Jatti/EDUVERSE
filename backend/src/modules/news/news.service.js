import axios from "axios";
import createError from "../../utils/ApiError.js";

const API_KEY = "pub_de8527a036374454b3e1280887e3f621";
const BASE_URL = "https://newsdata.io/api/1/news";

// Simple Enterprise Cache (In-Memory) to protect free tier credits
let newsCache = {
  data: null,
  expiry: 0
};

const CACHE_DURATION = 60 * 60 * 1000; // 60 Minutes Enterprise Cache

export const fetchTechNews = async (page = null) => {
    const now = Date.now();
    
    // Return cached data if valid
    if (newsCache.data && now < newsCache.expiry && !page) {
        console.log("Serving Tech News from Enterprise Cache ⚡ (Credits Protected)");
        return newsCache.data;
    }

    try {
        // Query for education, tech updates, and current affairs (academic focus)
        // Language restricted to English for professionalism
        const params = {
            apikey: API_KEY,
            q: 'education OR "new technology" OR "tech news" OR "current affairs"',
            language: 'en',
            category: 'technology,science,education',
            page: page || undefined
        };

        const response = await axios.get(BASE_URL, { params });
        
        const newsData = {
           results: response.data.results.map(article => ({
               id: article.article_id,
               title: article.title,
               link: article.link,
               description: article.description,
               image_url: article.image_url,
               source: article.source_id,
               pubDate: article.pubDate,
               category: article.category
           })),
           nextPage: response.data.nextPage
        };

        // Update cache only for the first page
        if (!page) {
            newsCache = {
                data: newsData,
                expiry: now + CACHE_DURATION
            };
        }

        return newsData;
    } catch (err) {
        console.error("News API Error:", err.response?.data || err.message);
        throw createError("SERVICE_UNAVAILABLE", "Failed to fetch high-performance intelligence. Please try again later.");
    }
};
