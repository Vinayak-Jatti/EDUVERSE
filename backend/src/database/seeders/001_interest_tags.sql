INSERT INTO interest_tags (name, slug, category) VALUES
  -- Technology
  ('Artificial Intelligence',  'ai',             'technology'),
  ('Web Development',          'web-dev',         'technology'),
  ('Cybersecurity',            'cybersecurity',   'technology'),
  ('Data Science',             'data-science',    'technology'),
  ('Mobile Development',       'mobile-dev',      'technology'),
  -- Science
  ('Physics',                  'physics',         'science'),
  ('Chemistry',                'chemistry',       'science'),
  ('Biology',                  'biology',         'science'),
  ('Mathematics',              'mathematics',     'science'),
  -- Arts & Humanities
  ('Literature',               'literature',      'arts'),
  ('History',                  'history',         'arts'),
  ('Philosophy',               'philosophy',      'arts'),
  ('Music',                    'music',           'arts'),
  -- Business
  ('Entrepreneurship',         'entrepreneurship','business'),
  ('Finance',                  'finance',         'business'),
  ('Marketing',                'marketing',       'business'),
  -- Lifestyle
  ('Photography',              'photography',     'lifestyle'),
  ('Sports',                   'sports',          'lifestyle'),
  ('Mental Health',            'mental-health',   'lifestyle'),
  ('Travel',                   'travel',          'lifestyle')
ON DUPLICATE KEY UPDATE name=name;
