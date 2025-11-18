-- Add Reddit-specific fields to signals table

-- Reddit post metadata
ALTER TABLE signals ADD COLUMN IF NOT EXISTS reddit_post_id TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS reddit_subreddit TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS reddit_author TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS reddit_score INTEGER;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS reddit_comments INTEGER;

-- Create index for Reddit posts
CREATE INDEX IF NOT EXISTS idx_signals_reddit_post_id ON signals(reddit_post_id);
CREATE INDEX IF NOT EXISTS idx_signals_reddit_subreddit ON signals(reddit_subreddit);

-- Add comment
COMMENT ON COLUMN signals.reddit_post_id IS 'Reddit post ID for community signals';
COMMENT ON COLUMN signals.reddit_subreddit IS 'Subreddit where the post was found';
COMMENT ON COLUMN signals.reddit_author IS 'Reddit username of the post author';
COMMENT ON COLUMN signals.reddit_score IS 'Reddit post score (upvotes)';
COMMENT ON COLUMN signals.reddit_comments IS 'Number of comments on the Reddit post';
