import { Avatar } from 'rsuite';

interface AuthorInfoProps {
  author: string;
  authorAvatar: string;
}

const AuthorInfo = ({ author, authorAvatar }: AuthorInfoProps) => {
  return (
    <div>
      <h6 className="section-header">作者</h6>
      <div className="author-container">
        <Avatar 
          src={authorAvatar} 
          alt={author} 
          className="author-avatar"
          circle 
          size="sm"
        />
        <p>{author}</p>
      </div>
    </div>
  );
};

export default AuthorInfo; 