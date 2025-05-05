export const dummyPosts = [
    {
      id: 1,
      title: "Just completed the React Hooks course!",
      content: "After weeks of study, I finally understand useState, useEffect, and custom hooks. Here's a simple counter component I built as practice. What do you think?",
      image: "/assets/images/placeholder-post.jpg",
      createdAt: "2 hours ago",
      likes: 24,
      author: {
        id: 1,
        name: "Alex Chen",
        avatar: "/assets/images/default-avatar.png"
      },
      comments: [
        {
          author: {
            id: 2,
            name: "Sarah Johnson",
            avatar: "/assets/images/default-avatar.png"
          },
          content: "Great job! Have you tried useContext yet?",
          createdAt: "45 minutes ago"
        },
        {
          author: {
            id: 3,
            name: "Mike Peters",
            avatar: "/assets/images/default-avatar.png"
          },
          content: "This looks clean! Maybe add some error handling with try/catch?",
          createdAt: "20 minutes ago"
        }
      ]
    },
    {
      id: 2,
      title: "Learning Node.js and Express",
      content: "I'm building my first REST API with Node.js and Express. It's amazing how quickly you can set up a server and start handling requests!",
      createdAt: "Yesterday",
      likes: 18,
      author: {
        id: 3,
        name: "Mike Peters",
        avatar: "/assets/images/default-avatar.png"
      },
      comments: [
        {
          author: {
            id: 1,
            name: "Alex Chen",
            avatar: "/assets/images/default-avatar.png"
          },
          content: "That's awesome! Are you using MongoDB with it?",
          createdAt: "10 hours ago"
        }
      ]
    },
    {
      id: 3,
      title: "Mastered CSS Grid and Flexbox",
      content: "After struggling with layouts for months, I finally feel comfortable with CSS Grid and Flexbox. Here's a responsive dashboard I created using both techniques.",
      image: "/assets/images/placeholder-post.jpg",
      createdAt: "3 days ago",
      likes: 42,
      author: {
        id: 2,
        name: "Sarah Johnson",
        avatar: "/assets/images/default-avatar.png"
      },
      comments: [
        {
          author: {
            id: 4,
            name: "David Kim",
            avatar: "/assets/images/default-avatar.png"
          },
          content: "This looks amazing! Could you share some resources you used to learn?",
          createdAt: "2 days ago"
        },
        {
          author: {
            id: 1,
            name: "Alex Chen",
            avatar: "/assets/images/default-avatar.png"
          },
          content: "The layout is super clean. Great job with the spacing!",
          createdAt: "1 day ago"
        }
      ]
    }
  ];
  