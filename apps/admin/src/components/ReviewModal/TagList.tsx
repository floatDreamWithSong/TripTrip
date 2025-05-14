import { Tag } from 'rsuite';

interface TagListProps {
  tags: string[];
}

const TagList = ({ tags }: TagListProps) => {
  return (
    <div>
      <h6 className="section-header">标签</h6>
      {tags && tags.length > 0 ? (
        tags.map(tag => (
          <Tag key={tag} color="blue" className="tag">{tag}</Tag>
        ))
      ) : (
        <p className="no-tags">暂无标签</p>
      )}
    </div>
  );
};

export default TagList; 